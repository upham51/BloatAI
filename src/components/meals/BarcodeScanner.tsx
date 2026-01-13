import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Package, Sparkles, ArrowRight, Info, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductByBarcode, OpenFoodFactsProduct, parseIngredients, getNutritionSummary } from '@/lib/openFoodFactsApi';
import { analyzeIngredients, getTriggerSummary } from '@/lib/ingredientAnalyzer';
import { DetectedTrigger } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';
import { TriggerSelectorModal } from '@/components/triggers/TriggerSelectorModal';
import { haptics } from '@/lib/haptics';

export function BarcodeScanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addEntry } = useMeals();
  const { user } = useAuth();

  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [detectedTriggers, setDetectedTriggers] = useState<DetectedTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'barcode-scanner-region';

  // Check and request camera permissions
  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Please use a modern browser like Chrome or Safari.',
        });
        return false;
      }

      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Stop the stream immediately - we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);

      // Provide specific error messages based on the error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast({
          variant: 'destructive',
          title: 'Camera Permission Denied',
          description: 'Please allow camera access in your browser settings and try again.',
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast({
          variant: 'destructive',
          title: 'No Camera Found',
          description: 'No camera was detected on your device.',
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast({
          variant: 'destructive',
          title: 'Camera In Use',
          description: 'Camera is already in use by another application. Please close other apps and try again.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Unable to access camera. Please check your browser settings.',
        });
      }
      return false;
    }
  };

  // Start camera scanner
  const startScanner = async () => {
    try {
      // First, explicitly check and request camera permissions
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        return;
      }

      // Set scanning state first so the container div renders
      setIsScanning(true);

      // Wait for the DOM to update before initializing the scanner
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if the scanner div exists now
      const scannerDiv = document.getElementById(scannerDivId);
      if (!scannerDiv) {
        console.error('Scanner container div not found after state update');
        toast({
          variant: 'destructive',
          title: 'Scanner Error',
          description: 'Failed to initialize scanner. Please try again.',
        });
        setIsScanning(false);
        return;
      }

      // Create scanner instance
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      console.log('Available cameras:', devices);

      if (devices.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Camera Found',
          description: 'No camera was detected on your device.',
        });
        setIsScanning(false);
        return;
      }

      // Prefer rear camera, fallback to first available
      const rearCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      );

      const cameraId = rearCamera?.id || devices[0].id;

      // Start scanning with selected camera
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
      
      console.log('Scanner started successfully with camera:', cameraId);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start the barcode scanner. Please try again.';
      if (err.message?.includes('permission')) {
        errorMessage = 'Camera permission was denied. Please allow camera access.';
      } else if (err.message?.includes('NotFoundError')) {
        errorMessage = 'No camera found on your device.';
      } else if (err.message?.includes('NotReadableError')) {
        errorMessage = 'Camera is in use by another app. Please close other apps.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Scanner Error',
        description: errorMessage,
      });
      setIsScanning(false);
    }
  };

  // Stop camera scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText: string) => {
    haptics.medium();
    console.log('Barcode scanned:', decodedText);

    // Stop scanner immediately
    await stopScanner();

    // Fetch product info
    await fetchProductInfo(decodedText);
  };

  // Handle scan failure (can be ignored, happens frequently)
  const onScanFailure = (error: string) => {
    // Silently ignore scan failures - they happen constantly while scanning
  };

  // Fetch product information from Open Food Facts
  const fetchProductInfo = async (barcode: string) => {
    setIsLoading(true);

    try {
      const product = await getProductByBarcode(barcode);

      if (!product) {
        toast({
          variant: 'destructive',
          title: 'Product Not Found',
          description: 'This barcode is not in our database. Try another product.',
        });
        setIsLoading(false);
        return;
      }

      setScannedProduct(product);

      // Analyze ingredients for FODMAP triggers
      if (product.ingredients_text) {
        const triggers = analyzeIngredients(product.ingredients_text);
        setDetectedTriggers(triggers);

        if (triggers.length > 0) {
          haptics.success();
          toast({
            title: 'Product Scanned!',
            description: `Detected ${triggers.length} potential trigger${triggers.length !== 1 ? 's' : ''}.`,
          });
        } else {
          haptics.light();
          toast({
            title: 'Product Scanned!',
            description: 'No common FODMAP triggers detected.',
          });
        }
      } else {
        toast({
          title: 'Product Scanned!',
          description: 'Ingredient information not available for this product.',
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch product information. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save scanned product as meal entry
  const handleSave = async () => {
    if (!scannedProduct || !user) return;

    setIsSaving(true);

    try {
      const nutrition = getNutritionSummary(scannedProduct);
      const description = `${scannedProduct.product_name}${scannedProduct.brands ? ` (${scannedProduct.brands})` : ''}`;

      // Include nutrition info in description if available
      const fullDescription = nutrition.calories > 0
        ? `${description}\n\nNutrition per 100g: ${nutrition.calories} cal, ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat`
        : description;

      const ratingDueAt = new Date(Date.now() + 90 * 60 * 1000).toISOString();

      await addEntry({
        meal_description: fullDescription,
        photo_url: null,
        portion_size: null,
        eating_speed: null,
        social_setting: null,
        bloating_rating: null,
        rating_status: 'pending',
        rating_due_at: ratingDueAt,
        detected_triggers: detectedTriggers,
        custom_title: scannedProduct.product_name || 'Scanned Product',
        meal_emoji: '📦',
        meal_title: scannedProduct.product_name || 'Scanned Product',
        title_options: [scannedProduct.product_name || 'Scanned Product'],
        notes: scannedProduct.ingredients_text ? `Ingredients: ${scannedProduct.ingredients_text}` : null,
        entry_method: 'text',
      });

      haptics.success();
      toast({
        title: 'Product Logged!',
        description: "We'll remind you to rate in 90 minutes.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add custom trigger
  const addTrigger = (trigger: DetectedTrigger) => {
    const exists = detectedTriggers.some(
      t => t.category === trigger.category && t.food === trigger.food
    );
    if (!exists) {
      setDetectedTriggers(prev => [...prev, trigger]);
    }
    setShowTriggerModal(false);
  };

  // Remove trigger
  const removeTrigger = (index: number) => {
    setDetectedTriggers(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">Scan Barcode</h1>
        <p className="text-muted-foreground">
          Scan a product barcode to analyze ingredients
        </p>
      </div>

      {/* Scanner or Product Info */}
      <div className="flex-1 px-6 pb-6">
        {!scannedProduct && !isLoading && (
          <div className="space-y-4">
            {/* Scanner Region */}
            {isScanning ? (
              <div className="space-y-4">
                <div
                  id={scannerDivId}
                  className="w-full rounded-2xl overflow-hidden border-2 border-primary"
                />
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  className="w-full"
                >
                  Cancel Scanning
                </Button>
              </div>
            ) : (
              <div className="glass-card p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Ready to Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    Point your camera at a product barcode
                  </p>
                </div>
                <Button onClick={startScanner} className="w-full">
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}

            {/* Info Card */}
            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">How it works</p>
                  <p>
                    Scan any product barcode to instantly see ingredients and detect potential FODMAP
                    triggers. Perfect for grocery shopping!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="font-semibold text-lg">Analyzing Product...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching ingredient information
            </p>
          </div>
        )}

        {scannedProduct && !isLoading && (
          <div className="space-y-4">
            {/* Product Info Card */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {scannedProduct.image_url ? (
                    <img
                      src={scannedProduct.image_url}
                      alt={scannedProduct.product_name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {scannedProduct.product_name}
                  </h3>
                  {scannedProduct.brands && (
                    <p className="text-sm text-muted-foreground">{scannedProduct.brands}</p>
                  )}
                </div>
              </div>

              {/* Nutrition Summary */}
              {scannedProduct.nutriments && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {scannedProduct.nutriments['energy-kcal_100g'] && (
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-bold">{scannedProduct.nutriments['energy-kcal_100g']}</p>
                    </div>
                  )}
                  {scannedProduct.nutriments['proteins_100g'] && (
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-bold">{scannedProduct.nutriments['proteins_100g']}g</p>
                    </div>
                  )}
                  {scannedProduct.nutriments['carbohydrates_100g'] && (
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-bold">{scannedProduct.nutriments['carbohydrates_100g']}g</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ingredients */}
              {scannedProduct.ingredients_text && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Ingredients
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {scannedProduct.ingredients_text}
                  </p>
                </div>
              )}
            </div>

            {/* Triggers Card */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-coral/30 to-peach/30">
                  <Sparkles className="w-5 h-5 text-coral" />
                </div>
                <h3 className="font-bold text-foreground text-lg">Detected Triggers</h3>
              </div>

              {detectedTriggers.length > 0 ? (
                <div className="space-y-2">
                  {detectedTriggers.map((trigger, index) => {
                    const icon = getIconForTrigger(trigger.food);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40"
                      >
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{trigger.food}</p>
                          <p className="text-xs text-muted-foreground">{trigger.category}</p>
                        </div>
                        <button
                          onClick={() => removeTrigger(index)}
                          className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No triggers detected — looking good!
                  </p>
                </div>
              )}

              <Button
                onClick={() => setShowTriggerModal(true)}
                variant="outline"
                className="w-full mt-4"
              >
                Add Trigger
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Log This Product
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button onClick={() => setScannedProduct(null)} variant="outline" className="w-full">
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trigger Selector Modal */}
      <TriggerSelectorModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        onAdd={addTrigger}
      />
    </div>
  );
}

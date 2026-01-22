import { useState, useEffect } from 'react';
import { HardDrive, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { localPhotoStorage } from '@/lib/localPhotoStorage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Storage Manager Component
 * Displays local storage usage and provides management options
 */
export function StorageManager() {
  const { toast } = useToast();
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    available: number;
    percentage: number;
  } | null>(null);
  const [photoStats, setPhotoStats] = useState<{
    count: number;
    totalSize: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Load storage information
  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    setIsLoading(true);
    try {
      const [info, count, size] = await Promise.all([
        localPhotoStorage.getStorageInfo(),
        localPhotoStorage.getPhotoCount(),
        localPhotoStorage.getTotalPhotoSize(),
      ]);

      setStorageInfo(info);
      setPhotoStats({ count, totalSize: size });
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllPhotos = async () => {
    setIsClearing(true);
    try {
      await localPhotoStorage.clearAllPhotos();
      toast({
        title: 'Photos cleared',
        description: 'All photos have been removed from local storage.',
      });
      await loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear photos:', error);
      toast({
        title: 'Failed to clear photos',
        description: 'An error occurred while clearing photos.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="premium-card p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>
    );
  }

  const warningThreshold = 80;
  const isNearLimit = storageInfo && storageInfo.percentage > warningThreshold;

  return (
    <div className="space-y-4">
      {/* Storage Overview */}
      <div className="premium-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Local Storage</h3>
          </div>
          {isNearLimit && (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
        </div>

        {/* Photo Stats */}
        {photoStats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Photos stored</span>
              <span className="font-medium text-foreground">{photoStats.count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage used by photos</span>
              <span className="font-medium text-foreground">{formatBytes(photoStats.totalSize)}</span>
            </div>
          </div>
        )}

        {/* Browser Storage Info */}
        {storageInfo && storageInfo.available > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total browser storage</span>
              <span className="font-medium text-foreground">
                {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
              </span>
            </div>

            {/* Storage Bar */}
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  storageInfo.percentage > 90
                    ? 'bg-red-500'
                    : storageInfo.percentage > 80
                    ? 'bg-yellow-500'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {storageInfo.percentage.toFixed(1)}% used
            </p>
          </div>
        )}

        {/* Warning Message */}
        {isNearLimit && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-1">Storage space running low</p>
              <p>Consider deleting old meal entries to free up space.</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1 text-foreground">Photos stored locally</p>
            <p>Your photos are saved directly on your device for instant access and maximum privacy. They never leave your device.</p>
          </div>
        </div>
      </div>

      {/* Management Actions */}
      {photoStats && photoStats.count > 0 && (
        <div className="premium-card p-4 space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Storage Management</h4>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear All Photos'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all photos?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {photoStats.count} photos ({formatBytes(photoStats.totalSize)}) from your device.
                  Your meal entries will remain, but without photos.
                  <br /><br />
                  <strong>This action cannot be undone.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllPhotos}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All Photos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground">
            Tip: Delete individual photos by deleting their meal entries from the History page.
          </p>
        </div>
      )}

      {/* Educational Info */}
      <div className="premium-card p-4 space-y-2">
        <h4 className="font-semibold text-sm text-foreground">About Local Storage</h4>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Photos are stored in your browser's IndexedDB - no cloud uploads</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>20-40x faster loading compared to cloud storage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Works offline - view your photos anytime</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">⚠️</span>
            <span>Photos are only on this device - clearing browser data will remove them</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

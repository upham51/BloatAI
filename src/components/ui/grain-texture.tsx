/**
 * GrainTexture - Adds a subtle organic grain/noise texture overlay
 *
 * This creates a premium, high-end feel by adding visual depth to screens.
 * The grain texture is a secret agency design trick that makes digital screens
 * feel more organic and less sterile.
 */
export function GrainTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
      }}
      aria-hidden="true"
    />
  );
}

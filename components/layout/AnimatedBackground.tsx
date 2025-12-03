/**
 * Animated background with floating blobs
 * Provides the signature glassmorphism aesthetic for the app
 *
 * @example
 * <AnimatedBackground />
 */
export function AnimatedBackground() {
  return (
    <>
      <div className="background-blob background-blob-1" aria-hidden="true" />
      <div className="background-blob background-blob-2" aria-hidden="true" />
      <div className="background-blob background-blob-3" aria-hidden="true" />
    </>
  );
}

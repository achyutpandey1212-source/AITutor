import React, { useRef, useEffect, useState } from 'react';

interface CinematicVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  videoStyle?: React.CSSProperties;
  overlayOpacity?: number;
  priority?: boolean; // When true, loads eagerly without waiting for viewport intersection
  aspectRatio?: string;
  borderRadius?: string;
  objectFit?: 'cover' | 'contain';
  blendMode?: 'normal' | 'multiply' | 'screen' | 'lighten' | 'darken';
}

export const CinematicVideo: React.FC<CinematicVideoProps> = ({
  src,
  poster,
  alt = 'Lumo cinematic visual demonstration',
  className,
  style,
  videoStyle,
  overlayOpacity = 0,
  priority = false,
  aspectRatio = '16 / 9',
  borderRadius = 'var(--radius-lg)',
  objectFit = 'cover',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Viewport intersection observer: lazy loads and pauses when offscreen
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (videoRef.current && !prefersReducedMotion) {
            videoRef.current.play().catch(() => {
              // Browser autoplay policy catch
            });
          }
        } else {
          // Pause offscreen videos to maximize client performance
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      {
        rootMargin: '120px 0px', // Preload slightly before scrolling into view
        threshold: 0.05,
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [priority, prefersReducedMotion]);

  // Handle play/pause with reduced motion
  useEffect(() => {
    if (!videoRef.current) return;
    if (prefersReducedMotion) {
      videoRef.current.pause();
    } else if (isInView) {
      videoRef.current.play().catch(() => {});
    }
  }, [prefersReducedMotion, isInView]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        borderRadius,
        overflow: 'hidden',
        background: 'var(--color-surface-soft)',
        ...style,
      }}
      aria-label={alt}
    >
      {/* Poster Image shown during load or with reduced motion */}
      {poster && (
        <img
          src={poster}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded && !prefersReducedMotion ? 0 : 1,
            transition: 'opacity var(--motion-standard) var(--ease-standard)',
            pointerEvents: 'none',
          }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Video Element (rendered when prioritized or scrolled into view) */}
      {(isInView || priority) && !prefersReducedMotion && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          onLoadedData={() => setIsLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity var(--motion-moderate) var(--ease-standard)',
            ...videoStyle,
          }}
        />
      )}

      {/* Optional dark/light protective ambient overlay */}
      {overlayOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-overlay)',
            opacity: overlayOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

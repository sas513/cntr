import { useEffect, useState } from 'react';

interface ImageCacheEntry {
  url: string;
  loaded: boolean;
  error: boolean;
}

const imageCache = new Map<string, ImageCacheEntry>();

/**
 * Hook for faster image loading with browser caching
 * Preloads and caches images for instant display
 */
export function useImageCache(src?: string | null) {
  const [imageState, setImageState] = useState<{
    src: string;
    loaded: boolean;
    error: boolean;
  }>({
    src: src || '/api/placeholder-image',
    loaded: false,
    error: false
  });

  useEffect(() => {
    if (!src) {
      setImageState({
        src: '/api/placeholder-image',
        loaded: true,
        error: false
      });
      return;
    }

    // Check cache first
    const cached = imageCache.get(src);
    if (cached) {
      setImageState({
        src: cached.error ? '/api/placeholder-image' : src,
        loaded: cached.loaded,
        error: cached.error
      });
      return;
    }

    // Create new image for preloading
    const img = new Image();
    
    const handleLoad = () => {
      imageCache.set(src, { url: src, loaded: true, error: false });
      setImageState({
        src,
        loaded: true,
        error: false
      });
    };

    const handleError = () => {
      imageCache.set(src, { url: src, loaded: true, error: true });
      setImageState({
        src: '/api/placeholder-image',
        loaded: true,
        error: true
      });
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    
    // Start loading
    img.src = src;

    // Set initial cache entry
    imageCache.set(src, { url: src, loaded: false, error: false });
    setImageState({
      src: '/api/placeholder-image', // Show placeholder while loading
      loaded: false,
      error: false
    });

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return imageState;
}

/**
 * Preload images for better performance
 */
export function preloadImages(urls: string[]) {
  urls.forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image();
      img.onload = () => imageCache.set(url, { url, loaded: true, error: false });
      img.onerror = () => imageCache.set(url, { url, loaded: true, error: true });
      img.src = url;
      imageCache.set(url, { url, loaded: false, error: false });
    }
  });
}
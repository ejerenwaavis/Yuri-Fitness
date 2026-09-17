/**
 * Yuri Fitness Image Pipeline & Duotone Engine
 * 
 * Provides unified dark, moody, high-contrast action photography with signature
 * neon lime / emerald green rim-light and duotone colorization.
 */

// Curated high-contrast, moody action photography matching the design reference
export const CINEMATIC_ASSETS = {
  // Hero athletic figure with dramatic rim lighting and pitch-dark background
  HERO_ATHLETE: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
  
  // Secondary athlete shot for routine detail header
  ROUTINE_HERO: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  
  // Misty mountain silhouette with dark mood for quote card
  QUOTE_MOUNTAIN: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  
  // Subtle dark background for Profile header
  PROFILE_HERO: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',

  // Exercise category fallbacks
  EXERCISE_PLACEHOLDER: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
};

/**
 * Transforms a source image URL to apply Cloudinary duotone parameters,
 * or standardizes Unsplash parameters for high-contrast presentation.
 */
export function getDuotoneImageUrl(
  sourceUrl?: string | null,
  fallback: string = CINEMATIC_ASSETS.HERO_ATHLETE
): string {
  const url = sourceUrl || fallback;

  // If already a Cloudinary image, inject named/raw transformation
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Inject grayscale + contrast + green tint
    const duotoneTransform = 'e_grayscale,e_contrast:40,co_rgb:8ce85b,e_colorize:20,q_auto,f_auto/';
    return url.replace('/upload/', `/upload/${duotoneTransform}`);
  }

  return url;
}

/**
 * Common CSS gradient overlay to blend hero photos into the dark UI background.
 * Direction: left (opaque dark surface) -> right (transparent with subtle green tint).
 */
export const HERO_OVERLAY_GRADIENT = 
  'linear-gradient(to right, #111310 0%, rgba(17,19,16,0.85) 35%, rgba(17,19,16,0.4) 70%, rgba(140,232,91,0.08) 100%)';

export const CARD_DUOTONE_OVERLAY =
  'linear-gradient(to top, rgba(17,19,16,0.95) 0%, rgba(17,19,16,0.6) 50%, rgba(140,232,91,0.05) 100%)';

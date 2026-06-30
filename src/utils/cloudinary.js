/**
 * Cloudinary asset mapping and image optimization helpers.
 */

export const CLOUDINARY_ASSET_MAP = {
  '/boutique-banner.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855639/alkarim-vision/assets/alkarim-vision/assets/boutique-banner.jpg',
  '/boutique-extra-1.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855641/alkarim-vision/assets/alkarim-vision/assets/boutique-extra-1.jpg',
  '/boutique-extra-2.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855642/alkarim-vision/assets/alkarim-vision/assets/boutique-extra-2.jpg',
  '/boutique-extra-3.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855643/alkarim-vision/assets/alkarim-vision/assets/boutique-extra-3.jpg',
  '/boutique-extra-4.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855645/alkarim-vision/assets/alkarim-vision/assets/boutique-extra-4.jpg',
  '/boutique-extra-5.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855646/alkarim-vision/assets/alkarim-vision/assets/boutique-extra-5.jpg',
  '/boutique-interieur-1.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855648/alkarim-vision/assets/alkarim-vision/assets/boutique-interieur-1.jpg',
  '/boutique-interieur-2.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855650/alkarim-vision/assets/alkarim-vision/assets/boutique-interieur-2.jpg',
  '/boutique-owner.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855651/alkarim-vision/assets/alkarim-vision/assets/boutique-owner.jpg',
  '/boutique-showroom.jpg': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855652/alkarim-vision/assets/alkarim-vision/assets/boutique-showroom.jpg',
  '/alkarim-portrait.png': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855654/alkarim-vision/assets/alkarim-vision/assets/alkarim-portrait.png',
  '/logo.png': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855678/alkarim-vision/assets/alkarim-vision/assets/logo.png',
  '/Al Karim Logo.png': 'https://res.cloudinary.com/davjg4chq/image/upload/v1782855700/alkarim-vision/assets/alkarim-vision/assets/al-karim-logo.png',
};

/**
 * Returns optimized image URL using Cloudinary transformations:
 * f_auto (auto format) and q_auto (auto quality / compression).
 * Optionally accepts a width limit or other custom options.
 *
 * @param {string} localPath - The relative path of the local asset (e.g. '/logo.png')
 * @param {object} options - Custom Cloudinary options like width (w), height (h), crop (c)
 * @returns {string} - The optimized URL (or original if not mapped/external)
 */
export function getOptimizedImageUrl(localPath, options = {}) {
  if (!localPath) return '';

  // If it's already an external / Cloudinary URL, we can inject optimization tags if it belongs to Cloudinary
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    if (localPath.includes('res.cloudinary.com')) {
      // Avoid duplicating parameters if already optimized
      if (localPath.includes('/upload/f_auto') || localPath.includes('/upload/q_auto')) {
        return localPath;
      }
      
      // Inject standard f_auto,q_auto optimizations
      const optString = 'f_auto,q_auto';
      return localPath.replace('/upload/', `/upload/${optString}/`);
    }
    return localPath;
  }

  // Get matching Cloudinary base URL from our map
  const mappedUrl = CLOUDINARY_ASSET_MAP[localPath];
  if (!mappedUrl) {
    return localPath; // Fallback to local public file
  }

  // Build the transformation parameters
  const transforms = ['f_auto', 'q_auto'];
  
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  
  const transformString = transforms.join(',');

  // Replace default upload node with our optimized transformations
  return mappedUrl.replace('/upload/', `/upload/${transformString}/`);
}

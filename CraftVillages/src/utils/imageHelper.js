const API_BASE_URL = 'http://localhost:9999';

/**
 * Get full image URL from relative path
 * @param {string} imagePath - Relative image path (e.g., "/uploads/products/image.jpg")
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/images/placeholder.jpg'; // Fallback image
    }

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If starts with /, it's a relative path from server
    if (imagePath.startsWith('/')) {
        return `${API_BASE_URL}${imagePath}`;
    }

    // Otherwise, assume it's a local public image
    return imagePath;
};

/**
 * Get product image URL
 * @param {object} product - Product object
 * @returns {string} Product image URL
 */
export const getProductImageUrl = (product) => {
    if (!product) return '/images/placeholder.jpg';
    
    // Try to get image from different possible fields
    const imagePath = product.image || product.images?.[0]?.url || product.images?.[0];
    return getImageUrl(imagePath);
};

/**
 * Get all product images
 * @param {object} product - Product object
 * @returns {array} Array of image URLs
 */
export const getProductImages = (product) => {
    if (!product || !product.images) return [];
    
    return product.images.map(img => {
        const path = typeof img === 'string' ? img : img.url;
        return getImageUrl(path);
    });
};


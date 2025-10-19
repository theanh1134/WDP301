import axios from 'axios';

const API_URL = 'http://localhost:9999';

class ProductService {
    // Create new product
    async createProduct(productData) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const formData = new FormData();
            
            // Append product data
            formData.append('shopId', productData.shopId);
            formData.append('categoryId', productData.categoryId);
            formData.append('productName', productData.productName);
            formData.append('description', productData.description);
            formData.append('sellingPrice', productData.sellingPrice);
            
            if (productData.quantity) {
                formData.append('quantity', productData.quantity);
            }
            
            if (productData.sku) {
                formData.append('sku', productData.sku);
            }

            // Append images
            if (productData.images && productData.images.length > 0) {
                productData.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await axios.post(
                `${API_URL}/products`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Create product error:', error);
            throw error.response?.data || error;
        }
    }

    // Get all products
    async getAllProducts(page = 1, limit = 8) {
        try {
            const response = await axios.get(`${API_URL}/products`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Get products error:', error);
            throw error.response?.data || error;
        }
    }

    // Get product by ID
    async getProductById(productId) {
        try {
            const response = await axios.get(`${API_URL}/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Get product error:', error);
            throw error.response?.data || error;
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId, excludeIds = []) {
        try {
            const response = await axios.get(`${API_URL}/products/category`, {
                params: {
                    category: categoryId,
                    exclude: excludeIds.join(',')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Get products by category error:', error);
            throw error.response?.data || error;
        }
    }

    // Update product
    async updateProduct(productId, productData) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            console.log('Updating product with data:', productData);

            const formData = new FormData();

            // Append product data
            if (productData.productName) {
                formData.append('productName', productData.productName);
            }
            if (productData.description) {
                formData.append('description', productData.description);
            }
            if (productData.sellingPrice) {
                formData.append('sellingPrice', productData.sellingPrice);
            }
            if (productData.categoryId) {
                formData.append('categoryId', productData.categoryId);
            }
            if (productData.quantity !== undefined && productData.quantity !== '') {
                console.log('Appending quantity:', productData.quantity);
                formData.append('quantity', productData.quantity);
            }
            if (productData.sku) {
                formData.append('sku', productData.sku);
            }

            // Append new images if any
            if (productData.images && productData.images.length > 0) {
                productData.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response = await axios.put(
                `${API_URL}/products/${productId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Update product error:', error);
            throw error.response?.data || error;
        }
    }

    // Delete product
    async deleteProduct(productId, shopId) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await axios.delete(
                `${API_URL}/products/${productId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: {
                        shopId: shopId
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error.response?.data || error;
        }
    }

    // Add inventory (restock)
    async addInventory(productId, inventoryData) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await axios.post(
                `${API_URL}/products/${productId}/inventory`,
                {
                    quantity: inventoryData.quantity,
                    costPrice: inventoryData.costPrice,
                    sellingPrice: inventoryData.sellingPrice
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Add inventory error:', error);
            throw error.response?.data || error;
        }
    }
}

export default new ProductService();


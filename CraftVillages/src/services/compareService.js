import axios from 'axios';

const API_URL = 'http://localhost:9999';

class CompareService {
    // Hàm helper để lấy loại sản phẩm từ tên
    getProductType(productName) {
        productName = productName.toLowerCase();
        if (productName.includes('ấm chén') || productName.includes('bộ trà')) return 'ấm chén';
        if (productName.includes('tượng')) return 'tượng';
        if (productName.includes('tranh')) return 'tranh';
        if (productName.includes('túi')) return 'túi';
        if (productName.includes('khăn')) return 'khăn';
        if (productName.includes('nón') || productName.includes('mũ')) return 'nón';
        if (productName.includes('giỏ')) return 'giỏ';
        if (productName.includes('đèn')) return 'đèn';
        if (productName.includes('hộp')) return 'hộp';
        return 'khác';
    }

    async getRelatedProducts(productName, excludeProductIds = []) {
        try {
            console.log('Fetching related products for:', productName);
            // Lấy tất cả sản phẩm
            const response = await axios.get(`${API_URL}/products`, {
                params: {
                    limit: 100 // Lấy nhiều sản phẩm hơn để có nhiều lựa chọn so sánh
                }
            });
            console.log('API Response:', response.data);

            // Lọc sản phẩm cùng loại
            const productType = this.getProductType(productName);
            console.log('Product type:', productType);

            let products = [];
            if (response.data.data && Array.isArray(response.data.data.products)) {
                products = response.data.data.products.filter(prod => {
                    const prodType = this.getProductType(prod.name);
                    const isExcluded = excludeProductIds.includes(prod._id);
                    console.log('Checking product:', {
                        name: prod.name,
                        type: prodType,
                        isExcluded,
                        matches: prodType === productType && !isExcluded
                    });
                    return prodType === productType && !isExcluded;
                });
            }

            console.log('Filtered products:', products);
            return products;
        } catch (error) {
            console.error('Error fetching related products:', error);
            return []; // Trả về mảng rỗng khi có lỗi
        }
    }

    async getProductsByCategory(categoryId) {
        try {
            const response = await axios.get(`${API_URL}/products/category`, {
                params: {
                    category: categoryId
                }
            });
            // Đảm bảo trả về một mảng
            return Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return []; // Trả về mảng rỗng khi có lỗi
        }
    }

    handleError(error) {
        if (error.response) {
            return new Error(error.response.data.message || 'An error occurred while fetching products');
        }
        if (error.request) {
            return new Error('Could not connect to the server. Please check your internet connection.');
        }
        return new Error('An unexpected error occurred');
    }
}

export default new CompareService();

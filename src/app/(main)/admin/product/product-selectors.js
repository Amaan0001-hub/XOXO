// product-selectors.js (Simple version - recommended)
export const productData = (state) => state.product.data;
export const productLoading = (state) => state.product.loading;
export const productError = (state) => state.product.error;
export const productSuccess = (state) => state.product.success;
export const activeProducts = (state) => state.product.activeProducts;
export const selectedProduct = (state) => state.product.selectedProduct;
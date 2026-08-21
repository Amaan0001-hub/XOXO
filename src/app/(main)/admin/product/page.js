"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, getProducts, updateProduct, deleteProduct } from '@/app/redux/slices/productSlice';
import { fetchActiveCategoryList } from '@/app/redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { productData, productLoading } from '@/app/(main)/admin/product/product-selectors';
import { activeCategories } from '@/app/(main)/admin/category/category-selectors';
import Spinner from '@/app/common/spinner';
import { 
  RiAddLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiCloseLine, 
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiShoppingBagLine,
  RiInformationLine,
  RiPercentLine,
  RiMoneyDollarCircleLine,
  RiBarChartLine,
  RiUserStarLine,
  RiFolderLine,
  RiRocketLine
} from "react-icons/ri";

const Product = () => {
  const dispatch = useDispatch();
  const loading = useSelector(productLoading);
  const data = useSelector(productData);
  const categories = useSelector(activeCategories);

  // Product States
  const [productName, setProductName] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [roi, setRoi] = useState('');
  const [minInvest, setMinInvest] = useState('');
  const [winRate, setWinRate] = useState('');
  const [traders, setTraders] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [active, setActive] = useState(true);
  
  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Type options
  const typeOptions = [
    { value: 'Low', label: 'Low', color: 'blue', icon: '🔵' },
    { value: 'Medium', label: 'Medium', color: 'yellow', icon: '🟡' },
    { value: 'High', label: 'High', color: 'red', icon: '🔴' }
  ];

  const getAdminUserId = () => {
    try {
      const userStr = localStorage.getItem('adminCurrentUserPlain');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user?.userData?.adminUserId || null;
    } catch (error) {
      console.error('Error getting adminUserId:', error);
      return null;
    }
  };

  // Function to fetch active categories
  const loadActiveCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      await dispatch(fetchActiveCategoryList()).unwrap();
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getProducts());
    loadActiveCategories();
  }, [dispatch, loadActiveCategories]);

  // Function to clear form fields without closing the form
  const clearFormFields = useCallback(() => {
    setProductName('');
    setTitle('');
    setType('');
    setRoi('');
    setMinInvest('');
    setWinRate('');
    setTraders('');
    setCategoryId('');
    setActive(true);
    setEditMode(false);
    setEditProductId(null);
    setErrors({});
  }, []);

  // Function to reset and close form
  const resetForm = useCallback(() => {
    clearFormFields();
    setShowForm(false);
  }, [clearFormFields]);

  const validateForm = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = 'Product Name is required';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!type) newErrors.type = 'Type is required';
    if (!roi) newErrors.roi = 'ROI is required';
    if (!minInvest) newErrors.minInvest = 'Minimum Investment is required';
    if (!winRate) newErrors.winRate = 'Win Rate is required';
    if (!traders) newErrors.traders = 'Traders is required';
    if (!categoryId) newErrors.categoryId = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const adminUserId = getAdminUserId();
    if (!adminUserId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    try {
      let response;

      if (editMode) {
        const updatePayload = {
          productId: editProductId,
          categoryId: categoryId,
          productname: productName,
          title: title,
          type: type,
          rating: 0,
          price: parseFloat(minInvest),
          totalReturn: parseFloat(roi),
          noOfRating: 0,
          active: active,
          updatedBy: adminUserId
        };
        
        response = await dispatch(updateProduct(updatePayload)).unwrap();
        
        if (response.statusCode === 200 || response.success) {
          toast.success(response.message || "Product updated successfully");
          resetForm();
          dispatch(getProducts());
        } else {
          toast.error(response.message || "Failed to update product");
        }
      } else {
        const addPayload = {
          categoryId: categoryId,
          createdBy: adminUserId,
          productName: productName,
          tittle: title,
          type: type,
          rOI: parseFloat(roi),
          minInvest: parseFloat(minInvest),
          winRate: parseFloat(winRate),
          traders: parseInt(traders),
          active: active
        };
        
        response = await dispatch(addProduct(addPayload)).unwrap();
        
        if (response.statusCode === 200 || response.success) {
          toast.success(response.message || "Product added successfully");
          resetForm();
          dispatch(getProducts());
        } else {
          toast.error(response.message || "Failed to add product");
        }
      }
    } catch (error) {
      console.error("Error during product submit:", error);
      toast.error(error?.message || "Failed to process request.");
    }
  };

  const handleEdit = (product) => {
    setProductName(product.productName || product.productname || '');
    setTitle(product.tittle || product.title || '');
    setType(product.type || '');
    setRoi(product.roi || product.rOI || product.totalReturn || '');
    setMinInvest(product.mininvest || product.minInvest || product.price || '');
    setWinRate(product.winrate || product.winRate || '');
    setTraders(product.traders || '');
    setCategoryId(product.categoryId || '');
    setActive(product.active || false);
    setEditMode(true);
    setEditProductId(product.productId);
    setShowForm(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    try {
      const deletePayload = {
        productId: productToDelete.productId,
        updatedBy: adminUserId
      };
      
      const res = await dispatch(deleteProduct(deletePayload)).unwrap();
      
      if (res.statusCode === 200 || res.success) {
        toast.success(res.message || "Product deleted successfully");
        dispatch(getProducts());
      } else {
        toast.error(res.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete product");
    } finally {
      setShowDeletePopup(false);
      setProductToDelete(null);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    if (status === true || status === 'Active' || status === 'active') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
        Active
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
        Inactive
      </span>;
    }
  };

  const getTypeBadge = (type) => {
    switch(type?.toLowerCase()) {
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
          <span className="mr-1">🔵</span> Low
        </span>;
      case 'medium':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200">
          <span className="mr-1">🟡</span> Medium
        </span>;
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200">
          <span className="mr-1">🔴</span> High
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          {type || 'N/A'}
        </span>;
    }
  };

  const DeletePopup = () => {
    if (!showDeletePopup) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-96 p-6 transform animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <RiDeleteBinLine className="text-red-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete product <span className="font-semibold text-gray-900 dark:text-white">"{productToDelete?.productName}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeletePopup(false);
                setProductToDelete(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formTitle = editMode ? "Edit Product" : "Add New Product";
  const submitButtonText = loading ? (editMode ? "Updating..." : "Adding...") : (editMode ? "Update Product" : "Add Product");

  return (
    <div className="">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <RiShoppingBagLine className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Product Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Manage your product inventory efficiently
                </p>
              </div>
            </div>
            
            {!showForm && (
              <button
                onClick={async () => {
                  clearFormFields();
                  setShowForm(true);
                  setEditMode(false);
                  await loadActiveCategories();
                }}
                className="group px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <RiAddLine className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                Add New Product
              </button>
            )}
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editMode ? <RiEditLine className="text-xl" /> : <RiRocketLine className="text-xl" />}
                {formTitle}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (errors.productName) setErrors({ ...errors, productName: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.productName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.productName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.productName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.title 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      if (errors.type) setErrors({ ...errors, type: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.type 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  >
                    <option value="">Select Type</option>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {categoriesLoading ? (
                    <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 flex justify-center">
                      <Spinner size={5} color="text-emerald-600" />
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                        ${errors.categoryId 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                    >
                      <option value="">Select Category</option>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryId}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No categories available</option>
                      )}
                    </select>
                  )}
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiPercentLine className="inline mr-1" /> ROI (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter ROI"
                    value={roi}
                    onChange={(e) => {
                      setRoi(e.target.value);
                      if (errors.roi) setErrors({ ...errors, roi: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.roi 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.roi && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.roi}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiMoneyDollarCircleLine className="inline mr-1" /> Minimum Investment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter minimum investment"
                    value={minInvest}
                    onChange={(e) => {
                      setMinInvest(e.target.value);
                      if (errors.minInvest) setErrors({ ...errors, minInvest: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.minInvest 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.minInvest && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.minInvest}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiBarChartLine className="inline mr-1" /> Win Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter win rate"
                    value={winRate}
                    onChange={(e) => {
                      setWinRate(e.target.value);
                      if (errors.winRate) setErrors({ ...errors, winRate: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.winRate 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.winRate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.winRate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <RiUserStarLine className="inline mr-1" /> Traders <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter number of traders"
                    value={traders}
                    onChange={(e) => {
                      setTraders(e.target.value);
                      if (errors.traders) setErrors({ ...errors, traders: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                      ${errors.traders 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                  />
                  {errors.traders && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <RiInformationLine className="text-sm" />
                      {errors.traders}
                    </p>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="mt-5 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Active Status
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                  disabled={loading}
                >
                  {loading && <Spinner size={4} color="text-white" />}
                  {submitButtonText}
                  {!loading && <RiCheckLine className="text-lg" />}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <RiCloseLine className="text-lg" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {!showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner size={12} color="text-emerald-600" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">S.No.</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ROI</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Min Invest</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Win Rate</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Traders</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                          <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {indexOfFirstItem + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                                  <RiShoppingBagLine className="text-emerald-600 dark:text-emerald-400 text-sm" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.tittle}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getTypeBadge(item.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                                <RiPercentLine className="text-emerald-500" />
                                {item.roi}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                                <RiMoneyDollarCircleLine className="text-emerald-500" />
                                ${item.mininvest}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.winrate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                                <RiUserStarLine className="text-emerald-500" />
                                {item.traders}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(item.active)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Edit Product"
                                >
                                  <RiEditLine className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Delete Product"
                                >
                                  <RiDeleteBinLine className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <RiShoppingBagLine className="text-3xl text-gray-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                No products found
                              </p>
                              <button
                                onClick={async () => {
                                  clearFormFields();
                                  setShowForm(true);
                                  setEditMode(false);
                                  await loadActiveCategories();
                                }}
                                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                Add your first product
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200
                                bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200   bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      >
                        <RiArrowLeftSLine className="text-lg" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200
                                ${currentPage === pageNum
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200   bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      >
                        <RiArrowRightSLine className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <DeletePopup />
    </div>
  );
};

export default React.memo(Product);
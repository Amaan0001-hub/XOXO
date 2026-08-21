"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory, getCategory, deleteCategory, updateCategory } from '@/app/redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { categoryData, categoryLoading } from "@/app/(main)/admin/category/category-selectors";
import Spinner from '@/app/common/spinner';
import { 
  RiAddLine, 
  RiEditLine, 
  RiDeleteBinLine, 
  RiCloseLine, 
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFolderLine,
  RiInformationLine
} from "react-icons/ri";

const Category = () => {
  const dispatch = useDispatch();
  const loading = useSelector(categoryLoading);
  const data = useSelector(categoryData);

  const [name, setName] = useState('');
  const [active, setActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const limitToCharacters = (value, limit = 100) => {
    if (!value) return '';
    return value.slice(0, limit);
  };

  const validateRequiredField = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  };

  const getAdminUserId = () => {
    try {
      const userStr = localStorage.getItem('adminCurrentUserPlain');
      if (!userStr) {
        console.error('No user data found');
        return null;
      }
      const user = JSON.parse(userStr);
      return user?.userData?.adminUserId || null;
    } catch (error) {
      console.error('Error getting adminUserId:', error);
      return null;
    }
  };

  useEffect(() => {
    dispatch(getCategory());
  }, [dispatch]);

  const resetForm = useCallback(() => {
    setName('');
    setActive(false);
    setEditMode(false);
    setEditCategoryId(null);
    setShowForm(false);
    setErrors({});
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const limitedName = limitToCharacters(name);
    const nameError = validateRequiredField(limitedName, "Category Name");
    if (nameError) newErrors.name = nameError;
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
          categoryId: editCategoryId,
          name: name.trim(),
          active: active,
          updatedBy: adminUserId
        };
        response = await dispatch(updateCategory(updatePayload)).unwrap();
        if (response.statusCode === 200 || response.success) {
          toast.success(response.message || "Category updated successfully");
          resetForm();
          dispatch(getCategory());
        } else {
          toast.error(response.message || "Failed to update category");
        }
      } else {
        const addPayload = {
          name: name.trim(),
          createdBy: adminUserId
        };
        response = await dispatch(addCategory(addPayload)).unwrap();
        if (response.statusCode === 200 || response.success) {
          toast.success(response.message || "Category added successfully");
          resetForm();
          dispatch(getCategory());
        } else {
          toast.error(response.message || "Failed to add category");
        }
      }
    } catch (error) {
      console.error("Error during category submit:", error);
      toast.error(error?.message || "Failed to process request.");
    }
  };

  const handleEdit = (category) => {
    setName(category.name);
    setEditCategoryId(category.categoryId);
    setActive(category.active || false);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
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
        categoryId: categoryToDelete.categoryId,
        updatedBy: adminUserId
      };
      const res = await dispatch(deleteCategory(deletePayload)).unwrap();
      if (res.statusCode === 200 || res.success) {
        toast.success(res.message || "Category deleted successfully");
        dispatch(getCategory());
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete category");
    } finally {
      setShowDeletePopup(false);
      setCategoryToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
    } else if (status === false || status === 'Inactive' || status === 'inactive') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
        Inactive
      </span>;
    }
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200">
      {status || 'N/A'}
    </span>;
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
            Are you sure you want to delete category <span className="font-semibold text-gray-900 dark:text-white">"{categoryToDelete?.name}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeletePopup(false);
                setCategoryToDelete(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md"
            >
              Delete Category
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formTitle = editMode ? "Edit Category" : "Add New Category";
  const submitButtonText = loading ? (editMode ? "Updating..." : "Adding...") : (editMode ? "Update Category" : "Add Category");

  return (
    <div className="">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <RiFolderLine className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Category Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Manage your product categories efficiently
                </p>
              </div>
            </div>
            
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditMode(false);
                  setName('');
                  setActive(false);
                  setErrors({});
                }}
                className="group px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <RiAddLine className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                Add New Category
              </button>
            )}
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editMode ? <RiEditLine className="text-xl" /> : <RiAddLine className="text-xl" />}
                {formTitle}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter category name (e.g., Electronics, Clothing)"
                  value={name}
                  onChange={(e) => {
                    const newName = limitToCharacters(e.target.value);
                    setName(newName);
                    if (errors.name) {
                      setErrors((prevErrors) => ({ ...prevErrors, name: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900/50
                    ${errors.name 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500'
                    } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <RiInformationLine className="text-sm" />
                    {errors.name}
                  </p>
                )}
              </div>

              {editMode && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
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

              <div className="flex gap-3 pt-3">
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

        {/* Table Section */}
        {!showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner size={12} color="text-emerald-600" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading categories...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">S.No.</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                          <tr key={item.categoryId || item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {indexOfFirstItem + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                                  <RiFolderLine className="text-emerald-600 dark:text-emerald-400 text-sm" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(item.active !== undefined ? item.active : item.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Edit Category"
                                >
                                  <RiEditLine className="text-lg" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Delete Category"
                                >
                                  <RiDeleteBinLine className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <RiFolderLine className="text-3xl text-gray-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                No categories found
                              </p>
                              <button
                                onClick={() => {
                                  setShowForm(true);
                                  setEditMode(false);
                                  setName('');
                                  setActive(false);
                                  setErrors({});
                                }}
                                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                Add your first category
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

      {/* Delete Popup */}
      <DeletePopup />
    </div>
  );
};

export default React.memo(Category);
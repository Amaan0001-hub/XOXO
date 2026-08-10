"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchAllUsersDetails,getUserAllChatsAdmin } from '@/app/redux/slices/authSlice';
import { 
  RiSearchLine, 
  RiFilter3Line, 
  RiUser3Line,
  RiMailLine,  RiPhoneLine,
  RiCalendarLine,
  RiMore2Line,
  RiAddLine,
  RiRefreshLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiDownloadLine
} from 'react-icons/ri';

export default function AllUsersSearch({ onUserSelect, onExport, onRefresh }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, searchAllUsersData } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Fetch users from API
    dispatch(getSearchAllUsersDetails());
  }, [dispatch]);

  useEffect(() => {
    // Update users state when API data is available
    if (searchAllUsersData?.data) {
      setUsers(searchAllUsersData.data);
    }
  }, [searchAllUsersData]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  // Extract unique dynamic statuses from users data
  const uniqueStatuses = useMemo(() => {
    const statuses = users
      .map(user => user.Status)
      .filter(status => status && status.trim() !== '');
    
    // Get unique statuses and sort them logically
    const unique = [...new Set(statuses.map(s => s.toLowerCase()))];
    
    // Define a logical order for common statuses
    const statusOrder = ['active', 'pending', 'inactive', 'blocked', 'suspended'];
    const orderedStatuses = [];
    
    // Add statuses in defined order first
    statusOrder.forEach(status => {
      if (unique.includes(status)) {
        orderedStatuses.push(status);
      }
    });
    
    // Add any other statuses not in the standard list
    unique.forEach(status => {
      if (!orderedStatuses.includes(status)) {
        orderedStatuses.push(status);
      }
    });
    
    // Capitalize first letter for display
    return orderedStatuses.map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  }, [users]);

  // Filter users based on search query and status filter
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.FullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.Email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.PhoneNo || '').includes(searchQuery);
      
      const matchesFilter = filter === 'all' || (user.Status || '').toLowerCase() === filter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, filter]);

  // Format CreatedDate for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1, '...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        pages.push('...', totalPages);
      }
    }
    
    return pages;
  };

 
  const handleUserClick = async (user) => {
  setSelectedUser(user);
  
  if (onUserSelect) {
    onUserSelect(user);
  }

  try {
    
    await dispatch(getUserAllChatsAdmin(user.UserId || user.ID)).unwrap();
    router.push(`/admin/conversations?userId=${user.UserId || user.ID}`);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    router.push(`/admin/conversations?userId=${user.UserId || user.ID}`);
  }
};

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Users</h2>
         
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              dispatch(getSearchAllUsersDetails());
              onRefresh?.();
            }}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RiRefreshLine className="text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={() => onExport && onExport(filteredUsers)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
            title="Export to Excel"
          >
            <RiDownloadLine className="text-sm" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="relative">
          <RiFilter3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.length > 0 ? (
              uniqueStatuses.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {status}
                </option>
              ))
            ) : (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9488]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <RiUser3Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found matching your criteria</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">FullName</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Phone No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">CreatedDate</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr 
                  key={user.ID}
                  onClick={() => handleUserClick(user)}
                  className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50  whitespace-nowrap dark:hover:bg-gray-700/50 transition-colors cursor-pointer
                    ${selectedUser?.ID === user.ID ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
                  `}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                        <RiUser3Line className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white ">{user.FullName || '-'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.ID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <RiPhoneLine className="text-xs" /> {user.PhoneNo || '-'}
                    </p>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <RiMailLine className="text-xs" /> {user.Email || '-'}
                    </p>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <RiCalendarLine className="text-xs" /> {formatDate(user.CreatedDate)}
                    </p>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.Status)}`}>
                      {user.Status || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <RiMore2Line className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
          </div>

          {/* Pagination Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {endIndex} of {filteredUsers.length} entries
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="First Page"
            >
              <RiArrowLeftDoubleLine className="text-lg" />
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <RiArrowLeftSLine className="text-lg" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`min-w-[36px] h-9 px-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-center font-medium
                    ${page === currentPage
                      ? 'bg-[#0d9488] border-[#0d9488] text-white'
                      : page === '...'
                        ? 'border-transparent bg-transparent text-gray-400 cursor-default'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <RiArrowRightSLine className="text-lg" />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Last Page"
            >
              <RiArrowRightDoubleLine className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Selected User Details */}
      {selectedUser && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Selected User Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">FullName</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.FullName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone No</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.PhoneNo || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.Email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">CreatedDate</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.CreatedDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.Status || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


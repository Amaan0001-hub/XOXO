
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getUserAllChatsAdmin, chatMsgByIdAdmin } from '@/app/redux/slices/authSlice';
import { 
  RiArrowLeftSLine,
  RiUser3Line,
  RiChat3Line,
  RiCalendarLine,
  RiSearchLine,
  RiEyeLine,
  RiRefreshLine,
  RiMessage2Line,
  RiCloseLine,
  RiUserFill,
  RiRobot2Line
} from 'react-icons/ri';

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const dispatch = useDispatch();
  
  // Redux state se data le rahe hain
  const { loading, UserchatData, chatIDData } = useSelector((state) => state.auth);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (userId) {
      dispatch(getUserAllChatsAdmin(userId));
    }
  }, [userId, dispatch]);

  // Chat messages ka data
  useEffect(() => {
    if (chatIDData) {
      setMessagesLoading(false);
    }
  }, [chatIDData]);

  // Correct way to access data
  const conversations = UserchatData?.data || [];

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    (conv.ChatName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.FullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.ChatId?.toString() || '').includes(searchQuery)
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredConversations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredConversations.length);
  const currentConversations = filteredConversations.slice(startIndex, endIndex);

  // Format date for display
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

  // Format message time
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle "02-06-2026 12:04 AM" format
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        return `${parts[1]} ${parts[2] || ''}`.trim();
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Handle refresh conversations
  const handleRefresh = () => {
    if (userId) {
      dispatch(getUserAllChatsAdmin(userId));
    }
  };

  // Handle view chat details with messages
  const handleViewChat = async (chat) => {
    setSelectedChat(chat);
    setMessagesLoading(true);
    setShowMessagesModal(true);
    
    try {
      await dispatch(chatMsgByIdAdmin(chat.ChatId)).unwrap();
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setMessagesLoading(false);
     
      alert("Failed to load chat messages. Please try again.");
    }
  };

  // Close messages modal
  const closeMessagesModal = () => {
    setShowMessagesModal(false);
    setSelectedChat(null);
  };

  // Chat messages data - aapke response ke according
  const chatMessages = chatIDData?.data || [];

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <RiUser3Line className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No User Selected
          </h2>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg inline-flex items-center gap-2"
          >
            <RiArrowLeftSLine className="text-lg" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg inline-flex items-center hover:bg-gray-300"
        >
          <RiArrowLeftSLine className="mr-2" />
          Back to Users
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Conversations
            </h1>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <RiChat3Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No conversations found for this user.</p>
          <p className="text-sm text-gray-500 mt-2">
            The user hasn't started any conversations yet.
          </p>
        </div>
      ) : currentConversations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <RiChat3Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No conversations match your search criteria.</p>
          <p className="text-sm text-gray-500 mt-2">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Chat ID</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Chat Name</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Created Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">User</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentConversations.map((chat, index) => (
                    <tr 
                      key={chat.ChatId} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                    >
                      <td className="py-3 px-4 border-b">
                        <span className="font-medium text-gray-900">#{chat.ChatId}</span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900">{chat.ChatName}</p>
                          <p className="text-xs text-gray-500">{chat.message || "Chat details"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center gap-2">
                          <RiCalendarLine className="text-gray-400 text-sm" />
                          <span className="text-sm text-gray-600">
                            {formatDate(chat.CreatedDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center gap-2">
                          <RiUser3Line className="text-gray-400 text-sm" />
                          <span className="text-sm text-gray-600">{chat.FullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          chat.statuscode === 1 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {chat.statuscode === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={() => handleViewChat(chat)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                          title="View Chat Messages"
                          disabled={messagesLoading && selectedChat?.ChatId === chat.ChatId}
                        >
                          {messagesLoading && selectedChat?.ChatId === chat.ChatId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <>
                              <RiEyeLine className="text-gray-600" />
                              View Messages
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredConversations.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {filteredConversations.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1.5 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Messages Modal */}
      {showMessagesModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chat Messages
                </h3>
                
              </div>
              <button
                onClick={closeMessagesModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RiCloseLine className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Modal Content - Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <RiMessage2Line className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No messages found for this chat.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.MessageId}
                      className={`flex ${message.IsUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.IsUser
                            ? 'bg-blue-50 border border-blue-100'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        {/* Message Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-full ${
                            message.IsUser ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {message.IsUser ? (
                              <RiUserFill className={`w-4 h-4 ${message.IsUser ? 'text-blue-600' : 'text-gray-600'}`} />
                            ) : (
                              <RiRobot2Line className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              message.IsUser ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {message.Name || (message.IsUser ? 'User' : 'Assistant')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatMessageTime(message.CreatedDate)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Message Text */}
                        <div className={`p-3 rounded-lg ${
                          message.IsUser ? 'bg-white' : 'bg-white'
                        }`}>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {message.MessageText}
                          </p>
                        </div>
                        
                       
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t">
              <div className="flex justify-center items-center">
                
                <div className="flex ">
                  {/* <button
                    onClick={() => {
                      // Copy chat messages to clipboard
                      const text = chatMessages.map(m => 
                        `${m.IsUser ? 'User' : 'Assistant'} (${formatMessageTime(m.CreatedDate)}): ${m.MessageText}`
                      ).join('\n');
                      navigator.clipboard.writeText(text);
                      alert('Messages copied to clipboard!');
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Copy Messages
                  </button> */}
                  <button
                    onClick={closeMessagesModal}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-l"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Chat Details Panel (Optional) */}
      {selectedChat && !showMessagesModal && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Chat Details</h3>
            <button
              onClick={() => setSelectedChat(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Chat ID</p>
              <p className="text-sm font-medium text-gray-900">#{selectedChat.ChatId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Chat Name</p>
              <p className="text-sm font-medium text-gray-900">{selectedChat.ChatName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created Date</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(selectedChat.CreatedDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">User Name</p>
              <p className="text-sm font-medium text-gray-900">{selectedChat.FullName}</p>
            </div>
            <div className="md:col-span-2">
              <button
                onClick={() => handleViewChat(selectedChat)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <RiEyeLine />
                View Chat Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
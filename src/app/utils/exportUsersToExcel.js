import * as XLSX from 'xlsx';

/**
 * Export users data to Excel file
 * @param {Array} users - Array of user objects
 * @param {string} filename - Name of the Excel file (without extension)
 */
export const exportUsersToExcel = (users, filename = 'users_export') => {
  if (!users || users.length === 0) {
    console.warn('No users data to export');
    return;
  }

  // Transform user data for Excel export
  const excelData = users.map((user) => {
    if (!user) return null;
    
    const status = user.Status || 'Unknown';
    const statusStr = typeof status === 'string' && status !== 'Unknown' 
      ? status.charAt(0).toUpperCase() + status.slice(1) 
      : status;
    
    return {
      'ID': user.ID || 'N/A',
      'FullName': user.FullName || 'Unknown',
      'Email': user.Email || 'N/A',
      'Phone': user.PhoneNo || 'N/A',
      'Status': statusStr,
      'CreatedDate': user.CreatedDate || 'N/A',
      'UserId': user.UserId || 'N/A',
    };
  }).filter(row => row !== null);

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 10 },  // ID
    { wch: 25 },  // Name
    { wch: 35 },  // Email
    { wch: 20 },  // Phone
    { wch: 15 },  // Status
    { wch: 15 },  // Last Active
    { wch: 15 },  // Conversations
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

  // Generate Excel file
  const excelFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Download the file
  XLSX.writeFile(workbook, excelFilename);

  return excelFilename;
};

export default exportUsersToExcel;


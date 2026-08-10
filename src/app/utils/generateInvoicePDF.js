import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(24);
  doc.text('INVOICE', 20, 30);
  doc.setFontSize(12);
  doc.text(`Invoice #${invoiceData.invoiceNumber}`, 20, 45);
  doc.text(`Date: ${invoiceData.invoiceDate}`, 20, 55);

  // Company Info
  doc.setFontSize(18);
  doc.text('Rentelligence.ai', 140, 30);
  doc.setFontSize(12);
  doc.text('Event Booking Platform', 140, 40);
  doc.text('support@rentelligence.ai', 140, 50);

  // Bill To
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 75);
  doc.setFontSize(12);
  doc.text(invoiceData.customerName, 20, 85);
  doc.text(invoiceData.customerEmail, 20, 95);

  // Event Details
  doc.setFontSize(14);
  doc.text('Event Details:', 100, 75);
  doc.setFontSize(12);
  doc.text(invoiceData.eventTitle, 100, 85);
  doc.text(invoiceData.eventDate, 100, 95);
  doc.text(invoiceData.eventLocation, 100, 105);

  // Booking Information
  doc.setFontSize(14);
  doc.text('Booking Information:', 20, 125);
  doc.setFontSize(10);
  doc.text(`Booking ID: ${invoiceData.bookingId}`, 20, 135);
  doc.text(`Booking Date: ${invoiceData.bookingDate}`, 20, 145);
  doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 20, 155);
  doc.text(`Status: ${invoiceData.status}`, 20, 165);

  // Table Header
  doc.setFontSize(12);
  doc.text('Description', 20, 185);
  doc.text('Qty', 120, 185);
  doc.text('Unit Price', 140, 185);
  doc.text('Total', 170, 185);
  doc.line(20, 190, 190, 190); // Horizontal line

  // Table Row
  doc.setFontSize(10);
  doc.text(invoiceData.eventTitle, 20, 200);
  doc.text(invoiceData.ticketType, 20, 210);
  doc.text(invoiceData.quantity.toString(), 120, 200);
  doc.text(`$${invoiceData.unitPrice.toFixed(2)}`, 140, 200);
  doc.text(`$${invoiceData.total.toFixed(2)}`, 170, 200);
  doc.line(20, 215, 190, 215); // Horizontal line

  // Totals
  doc.setFontSize(12);
  doc.text('Subtotal:', 140, 235);
  doc.text(`$${invoiceData.subtotal.toFixed(2)}`, 170, 235);
  doc.text('Service Fee:', 140, 245);
  doc.text(`$${invoiceData.serviceFee.toFixed(2)}`, 170, 245);
  doc.line(140, 250, 190, 250); // Line before total
  doc.setFontSize(14);
  doc.text('Total:', 140, 260);
  doc.text(`$${invoiceData.total.toFixed(2)}`, 170, 260);

  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for choosing Rentelligence.ai!', 20, 280);
  doc.text('For any questions regarding this invoice, please contact us at support@rentelligence.ai', 20, 290);
  doc.text('This is a computer-generated invoice and does not require a signature.', 20, 300);

  // Save the PDF
  const pdfBlob = doc.output('blob');
  saveAs(pdfBlob, `Invoice_${invoiceData.eventTitle.replace(/\s+/g, '_')}.pdf`);
};

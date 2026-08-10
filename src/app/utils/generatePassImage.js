import jsPDF from 'jspdf';

export const generatePassImage = async (bookingData) => {
  try {
    const imgResponse = await fetch('https://imagedelivery.net/nq9qT5FHZv9Sg48UUnD1-A/d2f36281-ca1a-4b55-7d8f-9e4cfb0bc800/public');
    const imgBlob = await imgResponse.blob();
    const imgBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(imgBlob);
    });

    // Create an Image object to get natural dimensions
    const img = new Image();
    img.src = imgBase64;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [width, height]
    });

    pdf.addImage(imgBase64, 'JPEG', 0, 0, width, height);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255); 


    const data = [
      { text: `${bookingData.bookingId || 'N/A'}`, x: 1200, y: 169 },
      { text: `${bookingData.eventDate || 'Date not available'}`, x: 570, y: 260 },
      // { text: `${bookingData.seatBooked || 'N/A'}`, x: 50, y: 220 },
      { text: `${bookingData.eventTitle || 'Event Title'}`, x: 500, y: 200 },
      { text: `${bookingData.customerName || 'User'}`, x: 380, y: 30 },
      { text: `${bookingData.eventLocation || ''}`, x: 890, y: 260 },
      { text: `${bookingData.quantity }`, x: 1000, y: 346 },
    ];

    data.forEach(item => {
      pdf.text(item.text, item.x, item.y);
    });

    pdf.save(`Pass_${bookingData.eventTitle?.replace(/\s+/g, '_') || 'Event'}.pdf`);

  } catch (error) {
    console.error('Error generating pass PDF:', error);
  }
};

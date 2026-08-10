"use client";
import { useState } from "react";
const ImagePopup = ({ src, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <div className="flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="object-cover rounded-md cursor-pointer"
        width={32}
        height={16}
        onClick={openPopup}
      />
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closePopup}
        >

          <div
            className="max-w-[50%] max-h-[50%] relative"
            onClick={(e) => e.stopPropagation()} 
          >
            <img
              src={src}
              alt={alt}
              width={500} 
             height={500}
              className="object-contain rounded-md"
            />
            <button
              className="absolute px-3 py-1 text-black rounded-md top-2 right-2"
              onClick={closePopup}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePopup;
import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div 
          className={`inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} mx-auto`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Modal header */}
          <div className="px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-headline">
                {title}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none bg-gray-100 rounded-full p-1 transition duration-300"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="mt-4 px-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
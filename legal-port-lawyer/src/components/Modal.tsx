import React from 'react';

const Modal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
              <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
                  Cancel
              </button>
              <button onClick={onConfirm} className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">
                  Logout
              </button>
          </div>
      </div>
  </div>
);

export default Modal;
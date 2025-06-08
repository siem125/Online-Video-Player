import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { useModal } from '../Modal/ModalContext'; // Import modal context
import ThemeCustomizerModal from './Modal/ThemeCustomizerModal';

const ThemeModal: React.FC = () => {
  const { setTheme } = useTheme(); // Access setTheme (changeTheme)
  const { openModal } = useModal(); // Access openModal from ModalContext

  // Function to open the custom theme modal
  const openCustomThemeModal = () => {
    openModal(() => <ThemeCustomizerModal />); // Opens custom theme modal
  };

  return (
    <div>
      <h2>Select Theme</h2>
      <p>Select a theme for the application:</p>
      <div className="flex flex-col space-y-4">
        <button onClick={() => setTheme('light')} className="p-2 bg-gray-200 rounded-md">
          Light Theme
        </button>
        <button onClick={() => setTheme('dark')} className="p-2 bg-gray-800 text-white rounded-md">
          Dark Theme
        </button>
        <button onClick={() => setTheme('blue')} className="p-2 bg-blue-600 text-white rounded-md">
          Blue Theme
        </button>

        {/* Button to open custom theme modal */}
        <button
          onClick={openCustomThemeModal}
          className="p-2 bg-gray-500 text-white rounded-md"
        >
          Custom Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeModal;

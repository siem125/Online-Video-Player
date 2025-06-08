"use client";
import React from 'react';
import { useModal } from '../ModalContext';

const CustomModal = () => {
    const { modalContent, isModalOpen, closeModal } = useModal();

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <button 
                    className="absolute top-2 right-2 text-gray-700"
                    onClick={closeModal}
                >
                    ✖
                </button>
                {modalContent}
            </div>
        </div>
    );
};

export default CustomModal;

import React, { useEffect, useRef } from "react";
import { useModal } from "../ModalContext"; // Import ModalContext hook

const CustomModal: React.FC = () => {
  const { closeModal, modalContent, modalIsOpen, modalOptions } = useModal();
  const { width, height, showCloseButton, rounded } = modalOptions;
  const modalRef = useRef<HTMLDivElement>(null);

  // Sluit modal bij klikken buiten de content
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  // Sluit modal met de Escape toets
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!modalIsOpen) return null;

  const isFullscreen = width === "100vw" && height === "100vh";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div
        ref={modalRef}
        className={`relative bg-[var(--site-bg-color)] text-[var(--site-text-color)] shadow-lg transition-all 
          ${isFullscreen ? "w-screen h-screen p-4" : "p-6"} 
          ${rounded ? "rounded-lg" : "rounded-none"}
          overflow-y-auto`}
        style={{ width, height }}
      >
        {showCloseButton && (
          <button
            className="absolute top-2 right-2 colorSchemer hover:bg-[var(--site-bg-color)] w-10 h-10 rounded-full flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <span>X</span>
          </button>
        )}

        <div className="relative flex justify-center items-center h-full">
          {typeof modalContent === "function" ? modalContent() : modalContent}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

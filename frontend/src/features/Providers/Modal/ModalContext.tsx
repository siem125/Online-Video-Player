import React, { createContext, useContext, useState } from "react";

interface ModalOptions {
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  rounded?: boolean; // New property for rounded corners
}

interface ModalContextType {
  openModal: (modalContent: () => React.ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
  modalContent: (() => React.ReactNode) | null;
  modalIsOpen: boolean;
  modalOptions: ModalOptions;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<(() => React.ReactNode) | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({
    width: "50%",
    height: "50%",
    showCloseButton: true,
    rounded: true, // Default to true for rounded corners
  });

  const openModal = (content: () => React.ReactNode, options: ModalOptions = {}) => {
    setModalIsOpen(true);
    setModalContent(content);
    setModalOptions({
      width: options.width || "50%",
      height: options.height || "50%",
      showCloseButton: options.showCloseButton ?? true, // Default true if not provided
      rounded: options.rounded ?? true, // Default true if not provided
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalContent, modalIsOpen, modalOptions }}>
      {children}
    </ModalContext.Provider>
  );
};

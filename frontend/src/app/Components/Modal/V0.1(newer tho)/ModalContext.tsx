"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export enum ModalTypes {
    SMALLBOX = "smallbox",
    LARGEBOX = "largebox",
}

interface ModalContextType {
    modalContent: ReactNode | null;
    modalType: ModalTypes | null;
    isModalOpen: boolean;
    openModal: (content: ReactNode, type: ModalTypes) => void;
    closeModal: () => void;
    updateModalContent: (newContent: ReactNode) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [modalType, setModalType] = useState<ModalTypes | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (content: ReactNode, type: ModalTypes) => {
        setModalContent(content);
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setModalType(null);
    };

    // ✅ Added this for dynamic content updates without closing the modal
    const updateModalContent = (newContent: ReactNode) => {
        setModalContent(newContent);
    };

    return (
        <ModalContext.Provider value={{ modalContent, modalType, isModalOpen, openModal, closeModal, updateModalContent }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};

import { useModal, ModalTypes } from "./ModalContext";

export const useCustomModal = () => {
    const { openModal, closeModal, updateModalContent } = useModal();

    return { openModal, closeModal, updateModalContent, ModalTypes };
};

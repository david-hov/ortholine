import { Modal } from '@mui/material';

export const CustomModal = ({ open, handleClose, children }: any) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            {children}
        </Modal>
    );
}

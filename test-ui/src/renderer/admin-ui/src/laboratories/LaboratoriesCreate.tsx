import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';

export const LaboratoriesCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/laboratories');
    };

    const onSuccess = () => {
        redirect('/laboratories');
        refresh();
    };

    return (
        <Dialog className='create-edit' open={open}>
            <CreateModal resource='laboratories' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
            </CreateModal>
        </Dialog>
    );
}

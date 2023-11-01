import {
    useRedirect,
    TextInput,
    required,
    NumberInput,
    useRefresh,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { showNotification } from '../utils/utils';
import { EditModal } from '../utils/editModal';

export const InsuranceEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/insurance');
        refresh();
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000)
        refresh();
    };

    return (
        <Dialog className='create-edit' open={open}>
            <EditModal resource='Ապպա' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <NumberInput type='tel' validate={required('Պարտադիր դաշտ')} fullWidth source='percentage' label='Տոկոս %' />
            </EditModal>
        </Dialog >
    );
}

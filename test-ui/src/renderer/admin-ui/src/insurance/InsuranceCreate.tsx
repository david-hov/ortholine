import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    NumberInput,
} from 'react-admin';
import { Dialog } from '@mui/material';
import { CreateModal } from '../utils/createModal';

export const InsuranceCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/insurance');
    };

    const onSuccess = () => {
        redirect('/insurance');
        refresh();
    };

    return (
        <Dialog className='create-edit guide-insurance-create-modal' open={open}>
            <CreateModal resource='insurance' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <NumberInput type='tel' validate={required('Պարտադիր դաշտ')} fullWidth source='percentage' label='Տոկոս %' />
            </CreateModal>
        </Dialog>
    );
}

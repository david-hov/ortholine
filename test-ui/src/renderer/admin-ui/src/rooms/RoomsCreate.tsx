import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    ReferenceArrayInput,
    SelectArrayInput,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';

export const RoomsCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/rooms');
    };

    const onSuccess = () => {
        redirect('/rooms');
        refresh();
    };

    return (
        <Dialog className='create-edit guide-rooms-create-modal' open={open}>
            <CreateModal resource='rooms' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <ReferenceArrayInput source="doctors" reference="doctors">
                    <SelectArrayInput fullWidth label='Բժիշկներ' optionText="name" />
                </ReferenceArrayInput>
            </CreateModal>
        </Dialog>
    );
}

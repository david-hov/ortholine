import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';

export const PriceListsCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/priceLists');
    };

    const onSuccess = () => {
        redirect('/priceLists');
        refresh();
    };

    return (
        <Dialog className='create-edit guide-priceList-create-modal' open={open}>
            <CreateModal resource='priceLists' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <ReferenceInput source="insurance" reference="insurance">
                    <AutocompleteInput validate={required('Պարտադիր դաշտ')} fullWidth label='Ապահովագրական' optionText="name" />
                </ReferenceInput>
                <NumberInput type='tel' validate={required('Պարտադիր դաշտ')} fullWidth source='price' label='Արժեք' />
            </CreateModal>
        </Dialog>
    );
}

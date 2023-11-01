import {
    useRedirect,
    useRefresh,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    FormDataConsumer,
} from 'react-admin';
import { Dialog } from '@mui/material';

import { CreateModal } from '../utils/createModal';

export const UsersCreate = ({ open }: { open: boolean }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();

    const handleClose = () => {
        redirect('/users');
    };

    const onSuccess = () => {
        redirect('/users');
        refresh();
    };

    return (
        <Dialog className='create-edit guide-users-create-modal' open={open}>
            <CreateModal resource='users' validation={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='username' label='Օգտանուն' />
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='password' label='Գաղտնաբառ' />
                <ReferenceInput source="roles" reference="roles">
                    <SelectInput fullWidth validate={required('Պարտադիր դաշտ')} label='Դեր' optionText="name" />
                </ReferenceInput>
                <FormDataConsumer>
                    {({ formData }: any) => {
                        return (
                            formData.roles == 3 &&
                            <ReferenceInput filter={{ notHaveUser: true }} source="doctors" reference="doctors">
                                <SelectInput validate={required('Պարտադիր դաշտ')} fullWidth label='Բժիշկ/Օգտվող' optionText="name" />
                            </ReferenceInput>
                        )
                    }}
                </FormDataConsumer>
            </CreateModal>
        </Dialog>
    );
}

import {
    useRedirect,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    FormDataConsumer,
    useRefresh,
    FunctionField,
} from 'react-admin';
import { Dialog, Button } from '@mui/material';
import { showNotification } from '../utils/utils';
import { useController } from 'react-hook-form';

import { EditModal } from '../utils/editModal';
import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../utils/socketHook';
import { dataProvider } from '../dataProvider';

export const UsersEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const refresh = useRefresh();
    const socket = useSocket();
    const [tokenBody, setTokenBody] = useState<any>(null);

    const onMessage = useCallback((body: any) => {
        if (body.refreshToken) {
            setTokenBody(body)
        }
    }, []);

    useEffect(() => {
        socket.addEventListener('msgToClientGetToken', onMessage);
        return () => {
            socket.removeEventListener('msgToClientGetToken', onMessage);
        };
    }, [socket, onMessage])

    const handleClose = () => {
        redirect('/users');
    };

    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000);
        refresh();
    };

    {/* Google Calendar */}
    // const saveEmailToken = async (record: any) => {
    //     const data = await dataProvider.update('users', {
    //         id: record.id,
    //         data: record,
    //         previousData: {}
    //     })
    //     if (data) {
    //         showNotification('Պահպանված է', '', 'success', 2000);
    //         setTokenBody(null)
    //         refresh();
    //     }
    // };

    return (
        <Dialog className='create-edit' open={open}>
            <EditModal resource='Օգտվող' id={id} validate={undefined} onSuccess={onSuccess} handleClose={handleClose}>
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='name' label='Անուն' />
                <TextInput validate={required('Պարտադիր դաշտ')} fullWidth source='username' label='Օգտանուն' />
                <TextInput fullWidth source='newPassword' label='Փոխել գաղտնաբառ' />
                {/* Google Calendar */}
                {/* {tokenBody ?
                    <FunctionField
                        source="last_name" // used for sorting
                        label="Name"
                        render={(record: any) => record &&
                            <Button className='button-green' onClick={async () => {
                                record.googleToken = tokenBody.refreshToken
                                record.email = tokenBody.email
                                saveEmailToken(record)
                            }} variant='contained'>
                                Պահպանել էլ․ հասցեն
                            </Button>
                        }
                    />
                    :
                    <FunctionField
                        render={(record: any) => {
                            return <div>
                                <Button onClick={() => {
                                    const apiUrl = localStorage.getItem('engine-ip');
                                    if (apiUrl) {
                                        window.open(`${apiUrl}/users/google`, '_blank');
                                    }
                                } } variant='contained'>
                                    Ավելացնել google calendar
                                </Button>
                                {record.googleToken && <p>Օգտատերը կստանա Google Calendar-ում այցերը հետևալ email-ով <span style={{fontWeight: 'bolder'}}>{record.email}</span></p>}
                                </div>
                        }}
                    />
                } */}
                <FormDataConsumer>
                    {({ formData }: any) => {
                        const roleInputValue = useController({ name: 'roles' });
                        const change = () => {
                            roleInputValue.field.onChange(null)
                        }
                        return (
                            formData.roles != 1 ?
                                <>
                                    <ReferenceInput filter={{ notHaveUser: true }} source="doctors" reference="doctors">
                                        <SelectInput onChange={() => change()} fullWidth label='Բժիշկ/Օգտվող' optionText="name" />
                                    </ReferenceInput>
                                    <ReferenceInput filter={{ name: formData.doctors == null ? null : 'doctor' }} source="roles" reference="roles">
                                        <SelectInput fullWidth validate={required('Պարտադիր դաշտ')} label='Դեր' optionText="name" />
                                    </ReferenceInput>
                                </> : null)
                    }}
                </FormDataConsumer>
            </EditModal>
        </Dialog >
    );
}

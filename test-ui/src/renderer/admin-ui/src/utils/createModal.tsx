import {
    Create,
    SimpleForm,
    SaveButton,
    Toolbar,
} from 'react-admin';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Cancel';
import BackIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router-dom";

export const CreateModal = ({ resource, validation, onSuccess, handleClose, children }: any) => {
    const navigate = useNavigate();

    const CreateSaveButton = (props: any) => {
        return <SaveButton className='button-save' label='Պահպանել' {...props} />;
    };

    const CreateTooblar = () => (
        <Toolbar>
            <CreateSaveButton className='guide-create-modal-button' />
        </Toolbar>
    );

    return (
        <>
            <Create
                resource={resource}
                mutationOptions={{ onSuccess }}
                sx={{ width: 500, '& .RaCreate-main': { mt: 0 } }}
            >
                <SimpleForm validate={validation} toolbar={<CreateTooblar />}>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Button className='back' style={{ justifyContent: 'left' }} onClick={() => navigate(-1)}><BackIcon style={{ fontSize: '30px' }} /></Button>
                        <Button className='close' onClick={handleClose}><CloseIcon htmlColor='red' style={{ fontSize: '30px' }} /></Button>
                    </div>
                    {children}
                </SimpleForm>
            </Create>
        </>
    );
}

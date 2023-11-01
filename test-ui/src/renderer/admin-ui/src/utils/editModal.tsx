import {
    SimpleForm,
    SaveButton,
    Toolbar,
    Edit,
    DeleteWithUndoButton,
    useRecordContext,
    usePermissions,
    Loading,
    DeleteWithConfirmButton,
} from 'react-admin';
import { Button } from '@mui/material';
import BackIcon from '@mui/icons-material/KeyboardBackspace';
import CloseIcon from '@mui/icons-material/Cancel';
import { useNavigate } from "react-router-dom";
import { showNotification } from './utils';

export const EditModal = ({ resource, id, validate, onSuccess, handleClose, children }: any) => {
    const navigate = useNavigate();
    const { isLoading, permissions } = usePermissions();

    const PostSaveButton = (props: any) => {
        return <SaveButton className='button-save' {...props} />;
    };

    const PostEditToolbar = () => {
        const record = useRecordContext();
        const existSentSalary = record.feeHistory && record.feeHistory.findIndex((el: any) => el.feeSentToDoctor);
        return (
            <Toolbar>
                {(permissions == 'doctor' && record.disabled) ? <></> :
                    <>
                        <PostSaveButton />
                        {permissions != 'doctor' ? existSentSalary > -1 ?
                            <DeleteWithConfirmButton
                                className='button-red'
                                style={{ marginLeft: '25px' }}
                                confirmTitle='Այցելության հեռացում'
                                confirmContent="Առկա է փոխանցված գումար, ջնջելու դեպքում գումարը հետ չի կանչվի"
                            /> :
                            <DeleteWithUndoButton className='button-red' style={{ marginLeft: '25px' }} label='Ջնջել' />
                            : <></>
                        }
                        {/* {permissions == 'doctor' && record.lastVisitChecked == 'late' &&
                            <DeleteWithUndoButton className='button-red' style={{ marginLeft: '25px' }} label='Ջնջել' />
                        } */}
                    </>
                }
            </Toolbar>
        )
    };

    const onError = () => {
        showNotification('Սխալմունք', '', 'danger', 2000)
    }

    if (isLoading) return <Loading />

    return (
        <Edit
            id={id} mutationMode='pessimistic'
            mutationOptions={{ onSuccess, onError }}
            sx={{ width: 500, '& .RaCreate-main': { mt: 0 } }}
        >
            <SimpleForm validate={validate} className='edit-form' toolbar={<PostEditToolbar />}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    <Button className='resource-button' onClick={() => navigate(-1)}><BackIcon style={{ fontSize: '30px' }} /></Button>
                    <div className='resource-circle'>
                        <p className='resource-title'>{resource}</p>
                    </div>
                    <Button className='resource-button' onClick={handleClose}><CloseIcon htmlColor='red' style={{ fontSize: '30px' }} /></Button>
                </div>
                {children}
            </SimpleForm>
        </Edit>
    );
}

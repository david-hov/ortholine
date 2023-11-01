import {
    useListContext,
    Pagination,
    DeleteButton,
    ReferenceArrayField,
    ImageField,
    Loading,
    ImageInput,
} from 'react-admin';
import { Box, Stack } from '@mui/material';
import { dataProvider } from '../dataProvider';
import { useState } from 'react';
import { showNotification } from './utils';
import { CustomModal } from './customModal';

export const ImageInputField = ({ fieldName, create, perPage }: any) => {
    const [opened, openModalFile] = useState(false);
    const [file, setFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const onSuccess = () => {
        showNotification('Պահպանված է', '', 'success', 2000)
    };

    const openModal = async (imageId: any) => {
        openModalFile(true);
        setLoading(true)
        const { data } = await dataProvider.getOne('attachments', {
            id: imageId
        })
        setFile(data.src);
        setLoading(false)
    }

    const AttachmentField = (props: any) => {
        if (props.record.hasOwnProperty('rawFile')) {
            return <p>{props.record.title}</p>
        } else {
            if (props.record !== null) {
                return <div style={{ display: 'flex', flexDirection: 'column', margin: '0' }}>
                    <img style={{ margin: '0 5px', objectFit: 'contain' }} src={`${props.record.thumbnail}`} onClick={() => openModal(props.record.id)} width='100px' height='100px' />
                    <DeleteButton confirmTitle='Ջնջել տվյալ նկարը'
                        confirmContent='Դուք համոզվա՞ծ եք ջնջել այս նկարը' record={props.record} mutationOptions={{ onSuccess }} />
                </div>
            } else {
                return <span>-</span>;
            }
        }
    };

    const ImageList = () => {
        const { data } = useListContext();
        return (
            <div>
                <h2 style={{ marginTop: '10', textAlign: 'center' }}>Նկարներ</h2>
                <Stack style={{ padding: '0', display: 'flex', alignItems: 'center', flexDirection: 'row' }} spacing={2} sx={{ padding: 2 }}>
                    {data.map((item: any, key: number) => (
                        <AttachmentField key={key} label='Նկար' record={item} />
                    ))}
                </Stack>
            </div>
        );
    }

    return (
        <div>
            {create ? null :
                <ReferenceArrayField pagination={<Pagination />} perPage={perPage} source={`${fieldName}`} reference='attachments'>
                    <ImageList />
                </ReferenceArrayField>
            }
            <ImageInput multiple accept='.png, .jpg, .jpeg' source='newClientAttachment' label=' '>
                <ImageField source='src' />
            </ImageInput>
            <CustomModal open={opened} handleClose={() => openModalFile(false)} >
                <Box style={{
                    display: 'flex',
                    justifyContent: 'center',
                    outline: 'none',
                    width: 'auto',
                    height: '80%',
                }}>
                    {loading ? <Loading /> :
                        <img style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }} src={file} />}
                </Box>
            </CustomModal>
        </div>
    );
}

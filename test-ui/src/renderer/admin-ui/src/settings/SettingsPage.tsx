import { useEffect, useState } from 'react'
import { dataProvider } from '../dataProvider';
import { Box } from '@mui/material'
import { Edit, ImageField, ImageInput, NumberInput, required, SaveButton, SimpleForm, TextInput, Toolbar } from 'react-admin';
import { AlignmentButtons, FormatButtons, LevelSelect, LinkButtons, ListButtons, QuoteButtons, RichTextInput, RichTextInputToolbar } from 'ra-input-rich-text';

import { showNotification } from '../utils/utils';

export const SettingsPage = () => {
    const [data, setData] = useState<any>([]);

    const onSuccess = (body: any) => {
        showNotification('Պահպանված է', '', 'success', 2000)
        if (body.companyImage) {
            localStorage.setItem('image', body.companyImage);
        }
        if (body.companyName) {
            localStorage.setItem('companyName', body.companyName);
        }
    };

    useEffect(() => {
        const getSettings = async () => {
            const { data } = await dataProvider.getList('settings', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'id', order: 'DESC' },
                filter: {}
            })
            setData(data);
        }
        getSettings();
    }, [])

    const MyRichTextInputToolbar = ({ size, ...props }: any) => {
        return (
            <RichTextInputToolbar {...props}>
                <LevelSelect size={size} />
                <FormatButtons size={size} />
                <AlignmentButtons size={size} />
                <ListButtons size={size} />
                <LinkButtons size={size} />
                <QuoteButtons size={size} />
            </RichTextInputToolbar>
        );
    }

    return (
        <Box>
            {data.length !== 0 &&
                <Edit resource='settings' id={data[0].id} mutationMode='optimistic'
                    mutationOptions={{ onSuccess }}
                >
                    <SimpleForm toolbar={<Toolbar><SaveButton /></Toolbar>}>
                        <NumberInput validate={required('Պարտադիր դաշտ')} fullWidth source='xRayPrice' label='Ռենտգեն արժեք' />
                        <RichTextInput label='Ինֆո․ ընկերւթյան մասին (Ինֆորմացիա տպելու ժամանակ)' toolbar={<MyRichTextInputToolbar />} source="printDetailsInfo" />
                        <TextInput validate={required('Պարտադիր դաշտ')} fullWidth label='Տնօրեն' source='companyDirector' />
                        <TextInput validate={required('Պարտադիր դաշտ')} fullWidth label='Ընկերության անվանում' source='companyName' />
                        <ImageInput source="companyImage" label="Ընկերության նկար">
                            <ImageField source="src" title="title" />
                        </ImageInput>
                    </SimpleForm>
                </Edit>
            }
        </Box>
    )
}

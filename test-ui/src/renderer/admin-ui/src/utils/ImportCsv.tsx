import { isArray } from 'lodash';
import { ImportButton } from 'react-admin-import-csv';

import { showNotification } from './utils';

const ImportButtonCsv = (props: any) => {
    const config = {
        logging: false,
        disableImportNew: false,
        disableImportOverwrite: true,
        parseConfig: {
            header: true,
            dynamicTyping: true,
            transformHeader: (header: any) => {
                let label = header;
                label = label.replace(/[."]/g, '');
                return label;
            },
            transform: (value: any) => {
                // value = isNaN(value) ? value.replace(/[,]/g, '').trim() : value;
                return value;
            },
        },
        postCommitCallback: (data: any) => {
            const importErrors = data.filter((item: any) => item.success === false);
            const successLength = data.filter((item: any) => item.success === true).length;
            importErrors.forEach((item: any, key: number) => {
                if (isArray(item.err)) {
                    item.err.forEach((el: any) => {
                        showNotification(`Սխալ ֊ ${key + 1} տողում`, el, 'danger', 10000)
                    })
                } else {
                    showNotification(`Սխալ ֊ ${key + 1} տողում`, item.err, 'danger', 10000)
                }
            });
            showNotification('Ներբեռնված է', `${successLength} հատ`, successLength === 0 ? 'warning' : 'success', 10000)
        }
    };
    return <ImportButton label='Ներբեռնել' {...props} {...config} />;
};

export default ImportButtonCsv;

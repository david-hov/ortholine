import { Store } from 'react-notifications-component'
import _ from 'lodash';
import { number, required } from 'react-admin';

export const getUpdatedData = (oldData: any, newData: any) => {
    if (oldData) {
        return _.transform(newData, (result: any, value: any, key: any) => {
            if (!_.isEqual(value, oldData[key])) {
                result[key] = (_.isObject(value) && _.isObject(oldData[key])) ? value : value;
            }
        });
    } else {
        return newData;
    }
};

export const convertFileToBase64 = (file: Array<File>) => {
    const ResultType = (item: any, data: any) => {
        return {
            type: item.path?.rawFile.type || item.rawFile.type,
            data: data,
            fileName: item.path?.rawFile.path || item.path?.title || item.title || item.rawFile?.name,
            insertFile: Object.keys(item)[1],
        };
    };
    return Promise.all(file.filter((el: any) => el.path !== null).map((item: any) => {
        if (item.path?.hasOwnProperty('rawFile') || item.hasOwnProperty('rawFile')) {
            delete item.src;
            const reader = new FileReader();
            reader.readAsDataURL(item.path?.rawFile || item.rawFile);
            return new Promise((resolve) => {
                reader.onload = () => {
                    if (!reader.result) {
                        return;
                    }
                    const data = reader.result.toString().split(',')[1];
                    return resolve(ResultType(item, data));
                };
            });
        }
        return item;
    }));
};

export const showNotification = (title: string, subTitle: string, type: any, timeout: number) => {
    Store.addNotification({
        title: title,
        message: subTitle,
        type: type,
        insert: 'top',
        container: 'bottom-center',
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
            duration: timeout,
            onScreen: true
        }
    });
}

export const numberValidators = [required(), number()];
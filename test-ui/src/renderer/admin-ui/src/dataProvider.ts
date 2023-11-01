import { HttpError, DataProvider } from 'react-admin';
import Axios from 'axios';
import { convertFileToBase64 } from './utils/utils';
import { isArray } from 'lodash';
import envConfig from '../../../../env-prod.json';
import moment from 'moment';

// @ts-ignore
// const apiUrl = process.env.NODE_ENV !== 'development' ? envConfig['REACT_APP_ADMIN_API'] : process.env.REACT_APP_ADMIN_API;

const getServerIp = () => {
    const apiUrl = localStorage.getItem('engine-ip');
    return apiUrl;
};

const getToken = () => {
    const JWTToken = localStorage.getItem('token');
    return {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${JWTToken}`,
        },
    };
};

export const dataProvider: DataProvider = {
    getList: (resource: string, params: any) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = `filter=${encodeURIComponent(JSON.stringify(params.filter))}&limit=${perPage}&page=${page}&orderBy=${field}&orderDir=${order}`;
        const url = `${getServerIp()}/${resource}?${query}`;
        return Axios.get(url, getToken()).then((res) => ({
            data: res.data.data,
            total: parseInt(res.data.count),
        }));
    },

    getOne: (resource: string, params: any) => {
        return Axios.get(`${getServerIp()}/${resource}/${params.id}`, getToken()).then((res: any) => {
            return ({
                data: res.data,
            })
        }).catch((err: any) => {
            return Promise.reject(
                new HttpError(err.response.data.message, 500)
            );
        });;
    },

    getMany: (resource: string, params: any) => {
        const hasObjectIndex = params.ids.findIndex((e: any) => e.hasOwnProperty('id'));
        if (hasObjectIndex > -1) {
            params.ids.splice(hasObjectIndex, 1)
        }
        const notReadyToGet = params.ids.find((el: any) => el.hasOwnProperty('id'));
        if (notReadyToGet) {
            return Promise.resolve({
                data: []
            });
        } else {
            const query = `filter=${encodeURIComponent(JSON.stringify(params))}&limit=25&page=1&orderBy=visitDate&orderDir=ASC`;
            const url = `${getServerIp()}/${resource}?${query}`;
            return Axios.get(url, getToken()).then(({ data }: any) => ({
                data: data ? data.data : [],
                prices: data && data.prices ? data.prices : null
            }));
        }
    },

    getManyReference: (resource: string) => {
        const url = `${getServerIp()}/${resource}`;
        return Axios.get(url, { headers: getToken().headers }).then(({ headers, json }: any) => ({
            data: json,
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    },

    update: async (resource: string, params: any) => {
        const body = params.data;
        if (body.hasOwnProperty('newClientAttachment') && body.newClientAttachment !== null && body.newClientAttachment !== undefined) {
            body.newClientAttachment = await convertFileToBase64(body.newClientAttachment);
        }
        if (body.hasOwnProperty('companyImage') && body.companyImage !== null && body.companyImage !== undefined) {
            const imageData = await convertFileToBase64([body.companyImage]);
            body.companyImage = imageData[0]
        }
        if (resource === 'clientsTemplates') {
            if (params.previousData.confirmed != body.confirmed) {
                body.confirmedChanged = true;
            }
        }
        if (resource === 'visits') {
            if (body.price != null && params.previousData.price != null) {
                if (params.previousData.price != body.price) {
                    body.priceChanged = true;
                    body.previousPrice = params.previousData.price;
                }
            }
            if (moment(body.startDate).isSame(params.previousData.startDate) &&
                moment(body.endDate).isSame(params.previousData.endDate)) {
                delete body.googleCalendarEventId;
            }
            if (body.clients != null && params.previousData.clients != null) {
                if (params.previousData.clients != body.clients) {
                    body.clientsChanged = true;
                    body.previousClients = params.previousData.clients;
                }
            }
            if (body.balance !== null) {
                if ((params.previousData.balance < 0 || body.balance < 0) && (params.previousData.balance != body.balance)) {
                    body.balanceChanged = true;
                    body.previousBalancePrice = params.previousData.balance;
                }
                if (params.previousData.balance != body.balance) {
                    body.balanceNotifyChanged = true;
                    body.previousBalancePrice = params.previousData.balance == null ? 0 : params.previousData.balance;
                }
            }
            if (body.xRay !== null) {
                if (params.previousData.xRay == body.xRay) {
                    body.isXRayCanged = false;
                } else {
                    body.isXRayCanged = true;
                    body.previousXray = params.previousData.xRay
                }
            }
            if (body.clients !== null) {
                if (params.previousData.clients != body.clients) {
                    body.clientsChanged = true;
                    body.previousClients = params.previousData.clients;
                } else {
                    body.clientsChanged = false;
                }
            }
        }
        if (resource === 'clients') {
            if (body.deposit !== null) {
                if (params.previousData.deposit != undefined && params.previousData.deposit != body.deposit) {
                    body.depositChanged = true;
                    body.previousDeposit = params.previousData.deposit;
                }
            }
        }
        return Axios.put(`${getServerIp()}/${resource}/${params.id}`, body, getToken()).then(({ data }: any) => {
            return ({
                data: { id: data.id, ...data },
            })
        }).catch((err: any) => {
            return Promise.reject(
                err.response.data.message
            );
        });
    },

    updateMany: (resource: string, params: any) => {
        return Axios.put(`${getServerIp()}/${resource}`, params, getToken()).then(({ data }: any) => {
            return ({ data: data.json })
        }).catch((err: any) => {
            return Promise.reject(
                new HttpError(
                    (err && err.message),
                    500,
                    err,
                ),
            );
        });
    },

    create: async (resource: string, params: any) => {
        const body = params.data;
        if (body.hasOwnProperty('attachment') && body.attachment !== undefined) {
            body.attachment = await convertFileToBase64(body.attachment);
        } else if (body.attachment === undefined) {
            delete body.attachment
        }
        return Axios.post(`${getServerIp()}/${resource}`, body, getToken()).then(({ data }: any) => {
            return ({
                data: data.response.data,
            })
        }).catch((err: any) => {
            if (isArray(err.response.data.message) && err.response.data.message.length !== 0) {
                for (let i = 0; i <= err.response.data.message.length; i++) {
                    return Promise.reject(err.response.data.message[i])
                }
            }
            return Promise.reject(
                err.response.data.message
            );
        });
    },

    delete: (resource: string, params: any) => {
        return Axios.delete(`${getServerIp()}/${resource}/${params.id}`, getToken()).then(() => ({ data: params.previousData })).catch((err: any) => {
            return Promise.reject(
                err.response.data.message
            );
        });
    },

    deleteMany: (resource: string, params: any) => {
        const deletedIds = {
            ids: params.ids,
        };
        const token = getToken().headers;
        return Axios.delete(`${getServerIp()}/${resource}`, {
            headers: token,
            data: {
                ids: deletedIds.ids,
            },
        }).then(({ json }: any) => ({ data: [json] })).catch((err: any) => {
            return Promise.reject(
                err.response.data.message
            );
        });
    },
};

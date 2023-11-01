import axios from 'axios';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { AuthProvider } from 'ra-core';

const getServerIp = () => {
    const apiUrl = localStorage.getItem('engine-ip');
    return apiUrl;
};
export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    login: ({ username, password }: any) => {
        return new Promise((resolve, reject) => {
            axios(`${getServerIp()}/users/signin`, {
                method: 'POST',
                data: {
                    username,
                    password,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(res => {
                    localStorage.setItem('token', res.data.accessToken);
                    localStorage.setItem('name', res.data.name);
                    resolve(res);
                })
                .catch(err => {
                    reject(err.response);
                });
        });
    },
    // called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        return Promise.resolve();
    },
    // called when the API returns an error
    checkError: ({ status }: Response) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            const { exp }: JwtPayload = jwt_decode(accessToken);
            if (exp && exp < (new Date().getTime() / 1000)) {
                localStorage.removeItem('token');
                return Promise.reject();
            }
            return Promise.resolve();
        } else {
            localStorage.removeItem('token');
            return Promise.reject();
        }
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            const { role }: any = jwt_decode(accessToken);
            return role ? Promise.resolve(role) : Promise.reject();
        } else {
            return Promise.reject();
        }
    }
};
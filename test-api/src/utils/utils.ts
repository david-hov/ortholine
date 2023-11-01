import * as moment from 'moment';
import { decode } from 'jsonwebtoken';
import * as fs from 'fs';
const path = require('path');

export const convertToBase64 = (body) => {
    if (!fs.existsSync(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + body.attachment)) {
        body.attachment = null;
    } else {
        let data = fs.readFileSync(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + body.attachment,
            { encoding: 'base64', flag: 'r' });
        return data;
    }
}

export const getUserIdFromToken = (token) => {
    const userId = decode(token.replace(/^Bearer\s+/, '')).sub;
    return userId.toString();
};

export const getWeekData = async (data) => {
    const sevenDaysBefore = moment().subtract(7, 'days');
    const weekData = data.filter(item => moment(item.createdAt).isBetween(sevenDaysBefore, moment(), 'day', '[]'));
    const weeklyData = [];
    weekData.forEach((item) => {
        if (weeklyData.length === 0) {
            weeklyData.push({ date: moment(item.createdAt).format('YYYY/MM/DD'), total: 1 })
        } else {
            const foundDay = weeklyData.findIndex(x => x.date == moment(item.createdAt).format('YYYY/MM/DD'));
            if (foundDay > -1) {
                weeklyData[foundDay].total++;
            } else {
                weeklyData.push({ date: moment(item.createdAt).format('YYYY/MM/DD'), total: 1 })
            }
        }
    })

    return weeklyData
}

export const search = (qb, parsedFilter, resource) => {
    if (parsedFilter[resource] == true) {
        qb.andWhere(`clients.${resource} = :value`, { value: true })
    } else {
        qb.andWhere(`clients.${resource} = :value`, { value: false })
    }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const sharp = require('sharp');
const path = require('path');

import { Attachments } from './schemas/attachments.entity';



@Injectable()
export class AttachmentsService {
    constructor(
        @InjectRepository(Attachments)
        private readonly attachmentsRepository: Repository<Attachments>,
    ) { }

    async insertAttachment(newData, resourceData, resource) {
        for (let i = 0; i < newData.newClientAttachment.length; i++) {
            const fileName = uuidv4();
            const realPath = fileName + `.${newData.newClientAttachment[i].type.split('/')[1]}`;
            const savedFile = await new Promise(function (resolve, reject) {
                fs.writeFile(path.resolve(`${process.env.ATTACHMENTS_PATH}`) + '/' + realPath, newData.newClientAttachment[i].data, 'base64', function (err) {
                    if (err) reject(err);
                    else resolve(realPath);
                });
            });
            const base64ToBuffer = Buffer.from(newData.newClientAttachment[i].data, 'base64')
            const resizedImageBuffer = await sharp(base64ToBuffer)
                .resize(64, 64)
                .toBuffer()
            const resizedImageData = resizedImageBuffer.toString('base64');
            const thumbnailPath = fileName + '-thumbnail' + `.${newData.newClientAttachment[i].type.split('/')[1]}`;
            const savedFileThumbnail = await new Promise(function (resolve, reject) {
                fs.writeFile(path.resolve(`${process.env.ATTACHMENTS_PATH}`) + '/' + thumbnailPath, resizedImageData, 'base64', function (err) {
                    if (err) reject(err);
                    else resolve(thumbnailPath);
                });
            });
            await this.attachmentsRepository.save({
                src: savedFile.toString(),
                thumbnail: savedFileThumbnail.toString(),
                type: newData.newClientAttachment[i].type.split('/')[1],
                [resource]: resourceData
            })
        }
        const attachments = await this.attachmentsRepository.find({
            relations: [resource],
            loadRelationIds: true,
            where: {
                [resource]: resourceData
            }
        });
        return attachments
    }

    async getAttachments(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);

        const [list, count] = await this.attachmentsRepository
            .createQueryBuilder('attachments')
            .skip(skipNumber)
            .take(maxNumber)
            .getManyAndCount();

        return {
            data: list,
            count: count,
        };
    }

    async getAttachment(attachmentId: string) {
        try {
            const attachment = await this.attachmentsRepository.findOne(
                attachmentId);
            if (attachment.src) {
                let data = fs.readFileSync(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + attachment.src,
                    { encoding: 'base64', flag: 'r' });
                attachment.src = `data:image/${attachment.type};base64,${data}`;
            }
            return attachment;
        } catch (error) {
            throw new NotFoundException('Could not find attachment.');
        }
    }

    async getManyAttachments(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.attachmentsRepository.find({
            where: { id: In(filterData.ids) }
        });
        const result = data.map((item) => {
            try {
                let data = fs.readFileSync(path.resolve(`${process.env.ATTACHMENTS_PATH}`) + '/' + item.thumbnail,
                    { encoding: 'base64', flag: 'r' });
                item.thumbnail = `data:image/${item.type};base64, ` + data;
                return item
            } catch (err) {
                return;
            }
        }).filter(el => el !== undefined)

        return {
            data: result
        };
    }

    async deleteAttachment(attachmentId: any) {
        const data = await this.attachmentsRepository.findOne({
            where: { id: attachmentId }
        });
        const result = await this.attachmentsRepository.delete(attachmentId);
        await this.removePreviousInsertedFile(data)
        return result;
    }

    async removeAttachment(filePath) {
        fs.stat(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err, stats) => {
            if (err) {
                return
            }
            fs.unlink(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err) => {
                if (err) return console.log(err);
            });
        });
    }

    async removePreviousInsertedFile(body) {
        await this.removeAttachment(body.src)
        await this.removeAttachment(body.thumbnail)
    }

    async deleteAttachments(attachmentsIds): Promise<any> {
        const clientsData = await this.attachmentsRepository.findByIds(attachmentsIds);
        if (clientsData.length != 0) {
            clientsData.forEach(async el => await this.removePreviousInsertedFile(el))
            const result = await this.attachmentsRepository.delete(attachmentsIds);
            if (result) {
                return attachmentsIds
            }
        }
        return;
    }
}

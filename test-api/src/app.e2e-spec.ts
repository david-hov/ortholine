import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { DatabaseModule } from './configurations/database.module';
import { Doctors } from './doctors/schemas/doctors.entity';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Clients } from './clients/schemas/clients.entity';
import { Visits } from './visits/schemas/visits.entity';
import { VisitsService } from './visits/visits.service';
import { clientBody, doctorBody, updatingVisit, updatingVisit2, visitBody, visitBody2, visitBodyWithInsurance } from './tests/test-data';

describe('ReaderController (e2e)', () => {
    let app: INestApplication;
    let moduleNest;
    let repositoryMockDoctor: Repository<Doctors>;
    let repositoryMockClient: Repository<Clients>;
    let repositoryMockVisits: Repository<Visits>;
    let visitsService: VisitsService;

    beforeAll(async () => {
        if(process.env.ENV !== 'test') {
            Logger.error('Change ENV variable in .env file')
        } else {
            const module = await Test.createTestingModule({
                imports: [AppModule],
                providers: [
                    DatabaseModule,
                ],
            }).compile();
            moduleNest = module;
            app = module.createNestApplication();
            await app.init();
        }
    }, 30000);

    beforeEach(() => {
        repositoryMockDoctor = moduleNest.get(getRepositoryToken(Doctors));
        repositoryMockClient = moduleNest.get(getRepositoryToken(Clients));
        repositoryMockVisits = moduleNest.get(getRepositoryToken(Visits));
        visitsService = moduleNest.get(VisitsService);
    });

    afterAll(async (done) => {
        const entities = [getConnection().getMetadata(Visits), getConnection().getMetadata(Doctors), getConnection().getMetadata(Clients)];
        for (const entity of entities) {
            const repository = await getConnection().getRepository(entity.name);
            await repository.query(`DROP TABLE IF EXISTS ${entity.tableName} CASCADE;`);
        }
        await Promise.all([
            app.close(),
        ]);
        done();
    })
    describe('Creating doctor and client, add visits', () => {
        let doctorId;
        let clientId;
        let visit1Id;
        let visit2Id;
        // it('Create doctor', async () => {
        //     const data: any = await request(app.getHttpServer())
        //         .post('/doctors')
        //         .send(doctorBody)
        //     doctorId = JSON.parse(data.res.text).response.id;
        //     await repositoryMockDoctor.update(doctorId,{
        //         sumTotal: [
        //             { insurance: null, price: 50000 }
        //         ]
        //     })
        //     expect(await repositoryMockDoctor.findOne({ name: 'John' })).toHaveProperty('name', 'John');
        // })

        it('Create client', async () => {
            const data: any = await request(app.getHttpServer())
                .post('/clients')
                .send(clientBody)
            clientId = JSON.parse(data.res.text).response.id
            expect(await repositoryMockClient.findOne({ name: 'Hasmik' })).toHaveProperty('name', 'Hasmik');
        })

        it('Create visits', async () => {
            const visit1: any = await request(app.getHttpServer())
                .post('/visits')
                .send(visitBody)
            const visit2: any = await request(app.getHttpServer())
                .post('/visits')
                .send(visitBody2)
            await request(app.getHttpServer())
                .post('/visits')
                .send(visitBodyWithInsurance)
            visit1Id = JSON.parse(visit1.res.text).response.id
            visit2Id = JSON.parse(visit2.res.text).response.id
            expect(await repositoryMockVisits.findOne({ id: visit1Id })).toHaveProperty('id', visit1Id);
        })
    });

    describe('Update visits with price', () => {
        it('Calculate salary for doctor', async () => {
            await visitsService.updateVisits('', updatingVisit)
            await visitsService.updateVisits('', updatingVisit2)
            expect(await repositoryMockVisits.findOne({ id: updatingVisit2.id })).toHaveProperty('price', 45000);
        })
    });
})
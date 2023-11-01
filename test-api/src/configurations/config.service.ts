export class ConfigService {
    constructor() {}

    public get databaseType() {
        return process.env.DATABASE_TYPE;
    }

    public get databaseHost() {
        return process.env.DATABASE_HOST;
    }

    public get databasePort() {
        return Number(process.env.DATABASE_PORT);
    }

    public get databaseName() {
        return process.env.DATABASE_NAME;
    }

    public get databaseUserName() {
        return process.env.DATABASE_USERNAME;
    }

    public get databasePassword() {
        return process.env.DATABASE_PASSWORD;
    }
}

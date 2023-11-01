import * as WebHDFS from 'webhdfs';
require('dotenv').config();

export const hdfs = WebHDFS.createClient({
    user: process.env.HADOOP_USER,
    host: process.env.HADOOP_HOSTNAME,
    port: 9000,
    path: process.env.HADOOP_PATH,
});

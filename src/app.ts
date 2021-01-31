import { DBServer } from './db/db-server';
import { Server } from './server';

const dbServer = new DBServer();
const server = new Server();
dbServer.connect().then((msg) => {
    console.log(msg)
    server.start().then((serverStatus) => {
        console.log(`${serverStatus}\n`);
    })
}).catch(err => {
    console.log(err)
})

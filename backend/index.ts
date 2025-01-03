import dotenv from 'dotenv'; 
dotenv.config();
import express from "express";
import cors from "cors";
import db from "@config/db";
import router from "@routes";
import errorsMiddleware from '@middleware/errors.middleware';

const port = process.env.PORT;
const app = express();

// express config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    credentials: true,
    origin: '*'
}));
app.use("/", router);
// handle errors
app.use(errorsMiddleware);

// start the server
db.connect()
    .then(result => {
        console.log(result);
        app.listen(port, () => console.log(`listening on port ${port}`))
        .on("error", err => {
            if ("code" in err && err.code === 'EADDRINUSE') console.log('Port busy');
            else console.log(err);
        });
    })
    .catch(err => console.error(err));

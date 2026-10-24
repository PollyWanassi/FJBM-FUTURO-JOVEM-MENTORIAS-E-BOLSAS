import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRouter from './routes/auth.js';
import bolsasRouter from './routes/bolsas.js';
import mentoriasRouter from './routes/mentorias.js';
import mentorRouter from './routes/mentor.js';
import candidaturasRouter from './routes/candidaturas.js';
import adminRouter from './routes/admin.js';
import 'dotenv/config';

const app = express ();
const PORT = 8080;

app.use(cors());

//permite receber JSON no corpo dos pedidos
app.use(express.json());
app.use(authRouter);
app.use(bolsasRouter);
app.use(mentoriasRouter);
app.use(mentorRouter);
app.use(candidaturasRouter);
app.use(adminRouter);

app.get('/status', (req, res)=> {
    res.status (200)
    .json({
        message : "Hello, servidor funcionando",
        status : 'OK'
    })
})

// o servidor tambem entrega o frontend (http://localhost:8080)
const pastaFrontend = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend');
app.use(express.static(pastaFrontend));

app.listen(PORT, () => {

    console.log(`Servidor funcionando na porta ${PORT}`)

})

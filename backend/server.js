import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import 'dotenv/config';

const app = express ();
const PORT = 8080;

app.use(cors());

//permite receber JSON no corpo dos pedidos
app.use(express.json());
app.use(authRouter);

app.get('/', (req, res)=> {
    res.status (200)
    .json({
        message : "Hello, servidor funcionando",
        status : 'OK'
    })
})

app.listen(PORT, () => {

    console.log(`Servidor funcionando na porta ${PORT}`)

})

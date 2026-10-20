import express from 'express';// todo o ficheiro precisa que se adicione o express
import { login } from '../services/authService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import {
    cadastroMentor,
    cadastroEstudante
} from "../services/authService.js"

const router = express.Router();  // permite que criemos as rotas em outro file e mandemos ao serverjs

// rota para criar a conta/ cadastro

//================= cadastro do mentor================================//

router.post('/cadastro/mentor', async (req,res)=> {

    // dados recebidos do formulario
    const { nome,email,contacto,formacao,password } = req.body;
    
    try {
         const resultado = await cadastroMentor(nome,email,contacto,formacao,password);
        //resposta
        res.status(201).send(resultado);
    } catch (error) {
        // Resposta de erro
        res.status(error.statusCode || 500).send(
        error.statusCode ? error.message : 'Erro interno do servidor');
    }

})

//============================cadastro do estudante===========================//
router.post('/cadastro/estudante', async (req,res)=> {

    // dados recebidos do formulario
    const { nome,email,contacto,curso,media_ensinomedio,password } = req.body;

     try {
         const resultado = await cadastroEstudante(nome,email,contacto,curso,media_ensinomedio,password);
             //resposta
        res.status(201).send(resultado);
    } catch (error) {
        // Resposta de erro
        res.status(error.statusCode || 500).send(
        error.statusCode ? error.message : 'Erro interno do servidor');
    }

})
//=========================LoginUser========================================//
router.post('/loginUser', async (req,res)=>{
    const {email, password} = req.body;

    try {
        const resultado = await login(email,password);
        res.status(200).send(resultado);
    } catch (error) {
        console.error(error);
                // Resposta de erro
        res.status(error.statusCode || 500).send(
        error.statusCode ? error.message : 'Erro interno do servidor');
    }
})
//=============================ROTA DE TESTE, AUTORIZACAO=======================//
router.get('/perfil', authMiddleware, (req, res) => {
    res.status(200).json({
        mensagem: 'Acesso autorizado',
        utilizador: req.user
    });
});

export default router;


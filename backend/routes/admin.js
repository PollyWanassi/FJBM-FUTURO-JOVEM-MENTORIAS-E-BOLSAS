import express from 'express';
import { authMiddleware, apenasTipo } from '../middlewares/authMiddleware.js';
import { responderErro } from '../services/erro.js';
import {
    listarCandidaturasBolsas,
    decidirCandidatura
} from '../services/candidaturaService.js';
import {
    listarUtilizadores,
    criarUtilizador,
    atualizarUtilizador,
    removerUtilizador
} from '../services/userService.js';

const router = express.Router();

//=========================tudo aqui e so para o administrador=======================//
router.use('/admin', authMiddleware, apenasTipo('admin'));

//=========================candidaturas a bolsas=====================================//
router.get('/admin/candidaturas', (req, res)=> {
    try {
        res.status(200).json(listarCandidaturasBolsas());
    } catch (error) {
        responderErro(res, error);
    }
})

router.put('/admin/candidaturas/:id', (req, res)=> {
    try {
        res.status(200).send(decidirCandidatura(Number(req.params.id), (req.body ?? {}).estado));
    } catch (error) {
        responderErro(res, error);
    }
})

//=========================CRUD dos utilizadores=====================================//
router.get('/admin/utilizadores', (req, res)=> {
    try {
        res.status(200).json(listarUtilizadores());
    } catch (error) {
        responderErro(res, error);
    }
})

router.post('/admin/utilizadores', async (req, res)=> {
    try {
        res.status(201).send(await criarUtilizador(req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.put('/admin/utilizadores/:id', (req, res)=> {
    try {
        res.status(200).json(atualizarUtilizador(Number(req.params.id), req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.delete('/admin/utilizadores/:id', (req, res)=> {
    try {
        removerUtilizador(Number(req.params.id), req.user.email);
        res.status(200).send('Utilizador removido');
    } catch (error) {
        responderErro(res, error);
    }
})

export default router;

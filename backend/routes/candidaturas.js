import express from 'express';
import { authMiddleware, apenasTipo } from '../middlewares/authMiddleware.js';
import { responderErro } from '../services/erro.js';
import {
    candidatar,
    minhasCandidaturas,
    pagarMentoria
} from '../services/candidaturaService.js';

const router = express.Router();

//=========================candidaturas do estudante=================================//

// candidatar-se a uma bolsa ou inscrever-se numa mentoria
router.post('/candidaturas', authMiddleware, apenasTipo('estudante'), (req, res)=> {
    const { tipo, itemId } = req.body ?? {};

    try {
        res.status(201).json(candidatar(req.user.email, tipo, itemId));
    } catch (error) {
        responderErro(res, error);
    }
})

// os meus pedidos
router.get('/candidaturas/minhas', authMiddleware, apenasTipo('estudante'), (req, res)=> {
    try {
        res.status(200).json(minhasCandidaturas(req.user.email));
    } catch (error) {
        responderErro(res, error);
    }
})

// pagamento simulado de uma mentoria
router.post('/candidaturas/:id/pagar', authMiddleware, apenasTipo('estudante'), (req, res)=> {
    try {
        res.status(200).send(pagarMentoria(req.user.email, Number(req.params.id)));
    } catch (error) {
        responderErro(res, error);
    }
})

export default router;

import express from 'express';
import { authMiddleware, apenasTipo } from '../middlewares/authMiddleware.js';
import { responderErro } from '../services/erro.js';
import {
    minhasMentorias,
    criarMentoria,
    atualizarMentoria,
    apagarMentoria
} from '../services/mentoriaService.js';

const router = express.Router();

//=========================painel do mentor (so mentores)============================//

// as minhas mentorias, com a lista de inscritos
router.get('/mentor/mentorias', authMiddleware, apenasTipo('mentor'), (req, res)=> {
    try {
        res.status(200).json(minhasMentorias(req.user.email));
    } catch (error) {
        responderErro(res, error);
    }
})

router.post('/mentor/mentorias', authMiddleware, apenasTipo('mentor'), (req, res)=> {
    try {
        res.status(201).json(criarMentoria(req.user.email, req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.put('/mentor/mentorias/:id', authMiddleware, apenasTipo('mentor'), (req, res)=> {
    try {
        res.status(200).json(atualizarMentoria(req.user.email, Number(req.params.id), req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.delete('/mentor/mentorias/:id', authMiddleware, apenasTipo('mentor'), (req, res)=> {
    try {
        apagarMentoria(req.user.email, Number(req.params.id));
        res.status(200).send('Mentoria removida');
    } catch (error) {
        responderErro(res, error);
    }
})

export default router;

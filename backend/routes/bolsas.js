import express from 'express';
import { authMiddleware, apenasTipo } from '../middlewares/authMiddleware.js';
import { responderErro } from '../services/erro.js';
import {
    listarBolsas,
    criarBolsa,
    atualizarBolsa,
    apagarBolsa
} from '../services/bolsaService.js';

const router = express.Router();

//=========================listar (qualquer utilizador com login)====================//
router.get('/bolsas', authMiddleware, (req, res)=> {
    try {
        res.status(200).json(listarBolsas());
    } catch (error) {
        responderErro(res, error);
    }
})

//=========================CRUD (so administrador)===================================//
router.post('/bolsas', authMiddleware, apenasTipo('admin'), (req, res)=> {
    try {
        res.status(201).json(criarBolsa(req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.put('/bolsas/:id', authMiddleware, apenasTipo('admin'), (req, res)=> {
    try {
        res.status(200).json(atualizarBolsa(Number(req.params.id), req.body ?? {}));
    } catch (error) {
        responderErro(res, error);
    }
})

router.delete('/bolsas/:id', authMiddleware, apenasTipo('admin'), (req, res)=> {
    try {
        apagarBolsa(Number(req.params.id));
        res.status(200).send('Bolsa removida');
    } catch (error) {
        responderErro(res, error);
    }
})

export default router;

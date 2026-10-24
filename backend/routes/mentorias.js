import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { responderErro } from '../services/erro.js';
import { listarMentorias } from '../services/mentoriaService.js';

const router = express.Router();

//=========================listar (qualquer utilizador com login)====================//
router.get('/mentorias', authMiddleware, (req, res)=> {
    try {
        res.status(200).json(listarMentorias());
    } catch (error) {
        responderErro(res, error);
    }
})

export default router;

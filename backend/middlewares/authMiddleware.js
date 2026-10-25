import jwt from 'jsonwebtoken';
import { buscarEmail } from '../repositories/userRepositories.js';

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send("Acesso nao autorizado");
        return;
    }

    const verif = authHeader.startsWith('Bearer ');
     if(!verif){
        res.status(401).send("Token nao identificado");
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
    const dadosUtilizador = jwt.verify(token, process.env.JWT_SECRET);

    // confirma que o utilizador ainda existe e usa o tipo guardado (e nao o do token)
    const utilizador = buscarEmail(dadosUtilizador.email);
    if(!utilizador){
        return res.status(401).send("Utilizador nao existe");
    }

    req.user = {
        email: utilizador.email,
        tipo: String(utilizador.tipo).toLowerCase(),
        nome: utilizador.nome
    };
    next();
    } catch (error) {
    return res.status(401).send("Token inválido ou expirado");
}
}

// so deixa passar os tipos indicados: apenasTipo('admin'), apenasTipo('mentor', 'admin')...
export function apenasTipo(...tipos) {
    return (req, res, next) => {
        if(!tipos.includes(req.user.tipo)){
            res.status(403).send("Nao tem permissao para esta acao");
            return;
        }
        next();
    };
}

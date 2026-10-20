import jwt from 'jsonwebtoken';

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
    req.user = dadosUtilizador;
    next();
    } catch (error) {
    return res.status(401).send("Token inválido ou expirado");
}
}


// cria um erro com o codigo HTTP que vai ser enviado ao cliente
export function erroHttp(mensagem, statusCode){
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

// resposta de erro usada pelas rotas
export function responderErro(res, error){
    if (!error.statusCode) console.error(error);
    res.status(error.statusCode || 500).send(
    error.statusCode ? error.message : 'Erro interno do servidor');
}

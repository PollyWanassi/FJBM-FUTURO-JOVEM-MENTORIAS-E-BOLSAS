import { lerBolsas, gravarBolsas } from '../repositories/bolsaRepositories.js';
import { lerCandidaturas, gravarCandidaturas } from '../repositories/candidaturaRepositories.js';
import { proximoId } from '../repositories/ficheiro.js';
import { erroHttp } from './erro.js';

//=============validar os dados de uma bolsa==================================================//

function validarBolsa(dados){
    const { faculdade, sigla, titulo, modalidade, cobertura, vagas, data, requisitos } = dados;

    //verificar se os dados estao vazios
    if(!faculdade || !sigla || !titulo || !modalidade || !cobertura || !data || !requisitos || String(vagas ?? '').trim() === ''){
        throw erroHttp('Preencha todos os campos', 400);
    }

    if(String(sigla).trim().length > 3){
        throw erroHttp('A sigla deve ter no máximo 3 letras', 400);
    }

    const nVagas = Number(vagas);
    if(!Number.isInteger(nVagas) || nVagas < 0){
        throw erroHttp('As vagas devem ser um número inteiro (0 ou mais)', 400);
    }

    if(!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(new Date(data).getTime())){
        throw erroHttp('Data inválida', 400);
    }

    return {
        faculdade: String(faculdade).trim(),
        sigla: String(sigla).trim().toUpperCase(),
        titulo: String(titulo).trim(),
        modalidade: String(modalidade).trim(),
        cobertura: String(cobertura).trim(),
        vagas: nVagas,
        data: data,
        requisitos: String(requisitos).trim()
    };
}

//=============CRUD das bolsas (administrador)=================================================//

export function listarBolsas(){
    return lerBolsas();
}

export function criarBolsa(dados){
    const novaBolsa = validarBolsa(dados);
    const bolsas = lerBolsas();

    novaBolsa.id = proximoId(bolsas);
    novaBolsa.publicadoEm = new Date().toISOString().slice(0, 10);

    bolsas.push(novaBolsa);
    gravarBolsas(bolsas);
    return novaBolsa;
}

export function atualizarBolsa(id, dados){
    const novosDados = validarBolsa(dados);
    const bolsas = lerBolsas();

    const posicao = bolsas.findIndex((b)=> b.id === id);
    if(posicao === -1){
        throw erroHttp('Bolsa não encontrada', 404);
    }

    //mantem o id e a data de publicacao
    bolsas[posicao] = { ...bolsas[posicao], ...novosDados };
    gravarBolsas(bolsas);
    return bolsas[posicao];
}

export function apagarBolsa(id){
    const bolsas = lerBolsas();
    if(!bolsas.some((b)=> b.id === id)){
        throw erroHttp('Bolsa não encontrada', 404);
    }

    gravarBolsas(bolsas.filter((b)=> b.id !== id));

    //as candidaturas a esta bolsa deixam de ter sentido
    gravarCandidaturas(lerCandidaturas().filter((c)=> !(c.tipo === 'bolsa' && c.itemId === id)));
}

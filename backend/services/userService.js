import {
    buscarId,
    listarUsers,
    atualizarUser,
    removerUser
} from '../repositories/userRepositories.js';
import { lerMentorias, gravarMentorias } from '../repositories/mentoriaRepositories.js';
import { lerCandidaturas, gravarCandidaturas } from '../repositories/candidaturaRepositories.js';
import { cadastroMentor, cadastroEstudante } from './authService.js';
import { erroHttp } from './erro.js';

//a password nunca sai do servidor
function semPassword({ password, ...resto }){
    return resto;
}

//=============CRUD dos utilizadores (administrador)=============================================//

export function listarUtilizadores(){
    return listarUsers().map(semPassword);
}

//criar utilizador: usa as mesmas regras do cadastro
export async function criarUtilizador(dados){
    if(dados.tipo === 'mentor'){
        return cadastroMentor(dados.nome, dados.email, dados.contacto, dados.formacao, dados.password);
    }
    if(dados.tipo === 'estudante'){
        return cadastroEstudante(dados.nome, dados.email, dados.contacto, dados.curso, dados.media_ensinomedio, dados.password);
    }
    throw erroHttp('O tipo deve ser estudante ou mentor', 400);
}

export function atualizarUtilizador(id, dados){
    const user = buscarId(id);
    if(!user){
        throw erroHttp('Utilizador não encontrado', 404);
    }

    const { nome, contacto } = dados;
    if(!nome || !contacto){
        throw erroHttp('Preencha todos os campos', 400);
    }
    if(!/^9\d{8}$/.test(String(contacto))){
        throw erroHttp('O contacto deve começar com 9 e ter exatamente 9 dígitos', 400);
    }

    user.nome = String(nome).trim();
    user.contacto = String(contacto);

    if(user.tipo === 'estudante'){
        const media = Number(dados.media_ensinomedio);
        if(!dados.curso || !Number.isFinite(media) || media < 0 || media > 20){
            throw erroHttp('Indique o curso e uma média entre 0 e 20', 400);
        }
        user.curso = String(dados.curso).trim();
        user.media_ensinomedio = media;
    }

    if(user.tipo === 'mentor'){
        if(!dados.formacao){
            throw erroHttp('Indique a formação', 400);
        }
        user.formacao = String(dados.formacao).trim();
    }

    atualizarUser(user);
    return semPassword(user);
}

export function removerUtilizador(id, emailAdmin){
    const user = buscarId(id);
    if(!user){
        throw erroHttp('Utilizador não encontrado', 404);
    }
    if(user.email === emailAdmin){
        throw erroHttp('Não podes remover a tua própria conta', 409);
    }

    removerUser(id);

    //limpar tudo o que dependia deste utilizador
    let mentoriasRemovidas = [];
    if(user.tipo === 'mentor'){
        const mentorias = lerMentorias();
        mentoriasRemovidas = mentorias.filter((m)=> m.mentorEmail === user.email).map((m)=> m.id);
        gravarMentorias(mentorias.filter((m)=> m.mentorEmail !== user.email));
    }

    gravarCandidaturas(lerCandidaturas().filter((c)=>
        c.email !== user.email &&
        !(c.tipo === 'mentoria' && mentoriasRemovidas.includes(c.itemId))
    ));
}

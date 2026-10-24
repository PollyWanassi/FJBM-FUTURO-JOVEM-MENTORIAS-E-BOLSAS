import { lerMentorias, gravarMentorias } from '../repositories/mentoriaRepositories.js';
import { lerCandidaturas, gravarCandidaturas } from '../repositories/candidaturaRepositories.js';
import { buscarEmail } from '../repositories/userRepositories.js';
import { proximoId } from '../repositories/ficheiro.js';
import { erroHttp } from './erro.js';

//=============validar os dados de uma mentoria==================================================//

function validarMentoria(dados){
    const { titulo, data, hora, local, formato, vagas, preco } = dados;

    //verificar se os dados estao vazios
    if(!titulo || !data || !hora || !local || !formato || String(vagas ?? '').trim() === ''){
        throw erroHttp('Preencha todos os campos', 400);
    }

    if(!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(new Date(data).getTime())){
        throw erroHttp('Data inválida', 400);
    }

    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)){
        throw erroHttp('Hora inválida (use HH:MM)', 400);
    }

    if(formato !== 'Online' && formato !== 'Presencial'){
        throw erroHttp('O formato deve ser Online ou Presencial', 400);
    }

    const nVagas = Number(vagas);
    if(!Number.isInteger(nVagas) || nVagas < 0){
        throw erroHttp('As vagas devem ser um número inteiro (0 ou mais)', 400);
    }

    //preco em Kz (0 = gratuita)
    const nPreco = Number(preco || 0);
    if(!Number.isFinite(nPreco) || nPreco < 0){
        throw erroHttp('O preço deve ser 0 ou mais', 400);
    }

    return {
        titulo: String(titulo).trim(),
        data: data,
        hora: hora,
        local: String(local).trim(),
        formato: formato,
        vagas: nVagas,
        preco: nPreco
    };
}

//procura a mentoria e confirma que pertence ao mentor
function mentoriaDoMentor(mentorias, id, email){
    const posicao = mentorias.findIndex((m)=> m.id === id);
    if(posicao === -1){
        throw erroHttp('Mentoria não encontrada', 404);
    }
    if(mentorias[posicao].mentorEmail !== email){
        throw erroHttp('Esta mentoria não é tua', 403);
    }
    return posicao;
}

//=============listagem para todos os utilizadores===============================================//

export function listarMentorias(){
    //o email do mentor nao e mostrado aos outros utilizadores
    return lerMentorias().map(({ mentorEmail, ...resto }) => resto);
}

//=============painel do mentor==================================================================//

export function minhasMentorias(email){
    const candidaturas = lerCandidaturas();

    return lerMentorias()
        .filter((m)=> m.mentorEmail === email)
        .map(({ mentorEmail, ...m }) => ({
            ...m,
            inscritos: candidaturas
                .filter((c)=> c.tipo === 'mentoria' && c.itemId === m.id)
                .map((c)=> {
                    const aluno = buscarEmail(c.email);
                    return {
                        nome: aluno?.nome,
                        email: c.email,
                        contacto: aluno?.contacto,
                        estado: c.estado
                    };
                })
        }));
}

export function criarMentoria(email, dados){
    const novaMentoria = validarMentoria(dados);
    const mentorias = lerMentorias();

    novaMentoria.id = proximoId(mentorias);
    novaMentoria.mentorEmail = email;
    novaMentoria.mentor = buscarEmail(email).nome;
    novaMentoria.foto = 'imagens/macaco.jpg';
    novaMentoria.publicadoEm = new Date().toISOString().slice(0, 10);

    mentorias.push(novaMentoria);
    gravarMentorias(mentorias);
    return novaMentoria;
}

export function atualizarMentoria(email, id, dados){
    const novosDados = validarMentoria(dados);
    const mentorias = lerMentorias();
    const posicao = mentoriaDoMentor(mentorias, id, email);

    mentorias[posicao] = { ...mentorias[posicao], ...novosDados };
    gravarMentorias(mentorias);
    return mentorias[posicao];
}

export function apagarMentoria(email, id){
    const mentorias = lerMentorias();
    mentoriaDoMentor(mentorias, id, email);

    gravarMentorias(mentorias.filter((m)=> m.id !== id));

    //as inscricoes nesta mentoria deixam de ter sentido
    gravarCandidaturas(lerCandidaturas().filter((c)=> !(c.tipo === 'mentoria' && c.itemId === id)));
}

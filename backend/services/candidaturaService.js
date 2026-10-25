import { lerBolsas, gravarBolsas } from '../repositories/bolsaRepositories.js';
import { lerMentorias, gravarMentorias } from '../repositories/mentoriaRepositories.js';
import { lerCandidaturas, gravarCandidaturas } from '../repositories/candidaturaRepositories.js';
import { buscarEmail } from '../repositories/userRepositories.js';
import { proximoId } from '../repositories/ficheiro.js';
import { erroHttp } from './erro.js';

// Estados de uma candidatura (simulacao):
//   bolsa:    pendente -> aprovada ou rejeitada (decide o administrador)
//   mentoria: gratuita -> inscrita | paga -> por_pagar -> paga (pagamento simulado)

const hoje = () => new Date().toISOString().slice(0, 10);

//=============estudante: candidatar-se / inscrever-se=============================================//

export function candidatar(email, tipo, itemId){
    if(tipo !== 'bolsa' && tipo !== 'mentoria'){
        throw erroHttp('Tipo inválido', 400);
    }

    const itens = tipo === 'bolsa' ? lerBolsas() : lerMentorias();
    const item = itens.find((i)=> i.id === itemId);
    if(!item){
        throw erroHttp('Item não encontrado', 404);
    }

    const candidaturas = lerCandidaturas();
    const repetida = candidaturas.some((c)=> c.email === email && c.tipo === tipo && c.itemId === itemId);
    if(repetida){
        throw erroHttp('Já enviaste um pedido para este item', 409);
    }

    if(item.data < hoje()){
        throw erroHttp(tipo === 'bolsa' ? 'O prazo desta bolsa já terminou' : 'Esta mentoria já aconteceu', 409);
    }
    if(item.vagas <= 0){
        throw erroHttp('Já não há vagas', 409);
    }

    let estado = 'pendente';
    let mensagem = 'Candidatura enviada. Aguarda a decisão do administrador.';

    if(tipo === 'mentoria'){
        if(item.preco > 0){
            estado = 'por_pagar';
            mensagem = 'Inscrição guardada. Falta pagar em "Os meus pedidos".';
        } else {
            estado = 'inscrita';
            mensagem = 'Inscrição confirmada.';
            item.vagas -= 1; //ocupa uma vaga
            gravarMentorias(itens);
        }
    }

    candidaturas.push({
        id: proximoId(candidaturas),
        email: email,
        tipo: tipo,
        itemId: itemId,
        estado: estado,
        criadaEm: new Date().toISOString()
    });
    gravarCandidaturas(candidaturas);

    return { mensagem, estado };
}

export function minhasCandidaturas(email){
    const bolsas = lerBolsas();
    const mentorias = lerMentorias();

    return lerCandidaturas()
        .filter((c)=> c.email === email)
        .map((c)=> {
            const item = (c.tipo === 'bolsa' ? bolsas : mentorias).find((i)=> i.id === c.itemId);
            return {
                id: c.id,
                tipo: c.tipo,
                itemId: c.itemId,
                estado: c.estado,
                criadaEm: c.criadaEm,
                titulo: item?.titulo,
                quem: c.tipo === 'bolsa' ? item?.faculdade : item?.mentor,
                data: item?.data,
                preco: item?.preco || 0
            };
        })
        .reverse(); //mais recentes primeiro
}

//=============pagamento simulado de uma mentoria==================================================//

export function pagarMentoria(email, id){
    const candidaturas = lerCandidaturas();
    const candidatura = candidaturas.find((c)=> c.id === id && c.email === email);

    if(!candidatura || candidatura.tipo !== 'mentoria'){
        throw erroHttp('Inscrição não encontrada', 404);
    }
    if(candidatura.estado !== 'por_pagar'){
        throw erroHttp('Esta inscrição não está à espera de pagamento', 409);
    }

    const mentorias = lerMentorias();
    const mentoria = mentorias.find((m)=> m.id === candidatura.itemId);
    if(mentoria.vagas <= 0){
        throw erroHttp('Já não há vagas', 409);
    }

    mentoria.vagas -= 1;
    gravarMentorias(mentorias);

    candidatura.estado = 'paga';
    candidatura.pagaEm = new Date().toISOString();
    gravarCandidaturas(candidaturas);

    return 'Pagamento simulado com sucesso. Inscrição confirmada.';
}

//=============administrador: ver e decidir candidaturas a bolsas==================================//

export function listarCandidaturasBolsas(){
    const bolsas = lerBolsas();

    return lerCandidaturas()
        .filter((c)=> c.tipo === 'bolsa')
        .map((c)=> {
            const bolsa = bolsas.find((b)=> b.id === c.itemId);
            const aluno = buscarEmail(c.email);
            return {
                id: c.id,
                estado: c.estado,
                criadaEm: c.criadaEm,
                bolsa: bolsa ? `${bolsa.faculdade} - ${bolsa.titulo}` : '',
                nome: aluno?.nome,
                email: c.email,
                contacto: aluno?.contacto,
                curso: aluno?.curso,
                media_ensinomedio: aluno?.media_ensinomedio
            };
        })
        .reverse();
}

export function decidirCandidatura(id, estado){
    if(estado !== 'aprovada' && estado !== 'rejeitada'){
        throw erroHttp('Estado inválido', 400);
    }

    const candidaturas = lerCandidaturas();
    const candidatura = candidaturas.find((c)=> c.id === id && c.tipo === 'bolsa');
    if(!candidatura){
        throw erroHttp('Candidatura não encontrada', 404);
    }
    if(candidatura.estado !== 'pendente'){
        throw erroHttp('Esta candidatura já foi decidida', 409);
    }

    if(estado === 'aprovada'){
        const bolsas = lerBolsas();
        const bolsa = bolsas.find((b)=> b.id === candidatura.itemId);
        if(bolsa.vagas <= 0){
            throw erroHttp('Esta bolsa já não tem vagas', 409);
        }
        bolsa.vagas -= 1;
        gravarBolsas(bolsas);
    }

    candidatura.estado = estado;
    gravarCandidaturas(candidaturas);
    return `Candidatura ${estado}`;
}

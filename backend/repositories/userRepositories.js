import { lerFicheiro, gravarFicheiro, proximoId } from './ficheiro.js';

const FICHEIRO = './data/users.json';

export function guardarUser(newUser){
    //ler os dados que estao ficheiro json
    const Users = lerFicheiro(FICHEIRO);

    //cada utilizador recebe um id
    newUser.id = proximoId(Users);

    //adicionar os dados no fim do array
    Users.push(newUser);

    //gravar os dados atualizados
    gravarFicheiro(FICHEIRO, Users);
}

export function buscarEmail(emailproc){
    const userFind = lerFicheiro(FICHEIRO).find((proc)=> emailproc === proc.email );

    return userFind;
}

export function listarUsers(){
    return lerFicheiro(FICHEIRO);
}

export function buscarId(id){
    return lerFicheiro(FICHEIRO).find((proc)=> id === proc.id );
}

//substitui os dados de um utilizador ja existente
export function atualizarUser(userAtualizado){
    const Users = lerFicheiro(FICHEIRO);
    const posicao = Users.findIndex((proc)=> proc.id === userAtualizado.id);
    Users[posicao] = userAtualizado;
    gravarFicheiro(FICHEIRO, Users);
}

export function removerUser(id){
    const Users = lerFicheiro(FICHEIRO).filter((proc)=> proc.id !== id);
    gravarFicheiro(FICHEIRO, Users);
}

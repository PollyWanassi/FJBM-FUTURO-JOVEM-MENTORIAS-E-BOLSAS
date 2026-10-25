import { lerFicheiro, gravarFicheiro } from './ficheiro.js';

const FICHEIRO = './data/candidaturas.json';

export function lerCandidaturas(){
    return lerFicheiro(FICHEIRO);
}

export function gravarCandidaturas(candidaturas){
    gravarFicheiro(FICHEIRO, candidaturas);
}

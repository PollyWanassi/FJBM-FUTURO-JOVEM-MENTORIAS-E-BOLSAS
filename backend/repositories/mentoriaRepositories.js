import { lerFicheiro, gravarFicheiro } from './ficheiro.js';

const FICHEIRO = './data/mentorias.json';

export function lerMentorias(){
    return lerFicheiro(FICHEIRO);
}

export function gravarMentorias(mentorias){
    gravarFicheiro(FICHEIRO, mentorias);
}

import { lerFicheiro, gravarFicheiro } from './ficheiro.js';

const FICHEIRO = './data/bolsas.json';

export function lerBolsas(){
    return lerFicheiro(FICHEIRO);
}

export function gravarBolsas(bolsas){
    gravarFicheiro(FICHEIRO, bolsas);
}

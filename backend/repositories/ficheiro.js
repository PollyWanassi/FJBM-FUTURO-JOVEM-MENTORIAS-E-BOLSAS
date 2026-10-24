import fs from 'node:fs'; //para podermos trabalhar com a manipulacao de ficheiros

// ler um ficheiro json e devolver o array (ficheiro vazio ou inexistente = array vazio)
export function lerFicheiro(caminho){
    try {
        const texto = fs.readFileSync(caminho,'utf-8').trim();
        return texto ? JSON.parse(texto) : [];
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

// gravar o array atualizado no ficheiro json
export function gravarFicheiro(caminho, dados){
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

// gerar o proximo id livre de uma lista
export function proximoId(lista){
    return lista.reduce((maior, item) => Math.max(maior, item.id || 0), 0) + 1;
}

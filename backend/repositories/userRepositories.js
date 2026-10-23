import fs from 'node:fs'; //para podermos trabalhar com a manipulacao de ficheiros

    export function guardarUser(newUser){
            //ler os dados que estao ficheiro json
            const dexist = fs.readFileSync('./data/users.json','utf-8');
            
            // converter os dados para arrays
            const Users = JSON.parse(dexist);

            //adicionar os dados no fim do array
            Users.push(newUser);

            //gravar os dados atualizados
            fs.writeFileSync('./data/users.json', JSON.stringify(Users, null, 2));
        
    }

    export function buscarEmail(emailproc){
        const dataEx = fs.readFileSync('./data/users.json','utf-8');
        const userSearch = JSON.parse(dataEx);
        const userFind = userSearch.find((proc)=> emailproc === proc.email );
        
        return userFind;
    
    }
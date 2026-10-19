
    //ler os dados que estao ficheiro json
    const dexist = fs.readFileSync('./data/users.json','utf-8');

    // converter os dados para arrays
    const Users = JSON.parse(dexist);

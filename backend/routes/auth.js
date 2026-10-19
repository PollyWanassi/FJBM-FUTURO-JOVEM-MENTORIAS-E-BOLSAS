import express from 'express';// todo o ficheiro precisa que se adicione o express
import fs from 'node:fs'; //para podermos trabalhar com a manipulacao de ficheiros
const router = express.Router();  // permite que criemos as rotas em outro file e mandemos ao serverjs
import bcrypt from 'bcrypt';// serve para proteger a password no momento do cadastro

// rota para criar a conta/ cadastro

//================= cadastro do mentor================================//
router.post('/cadastro/mentor', async (req,res)=> {

    // dados recebidos do formulario
    const { nome,email,contacto,formacao,password } = req.body;

    //verificar se os dados estao vazios
    if(!nome || !email || !contacto || !formacao || !password){
        return res.status(400).json({
            mensagem: 'Preenche todos os campos.'
        });
    }


    //verificar se o email esta correcto
       if (!email.includes('@')) {
        return res.status(400).json({
            mensagem: 'O email não é válido.'
        });
    }

    //verificar se o numero esta correcto
    if(!/^9\d{8}$/.test(String(contacto))){
        return res.status(400).json
        ({
            mensagem: "O contacto deve começar com 9 e ter exatamente 9 dígitos"
        });
    }

    //ler os dados que estao ficheiro json
    const dexist = fs.readFileSync('./data/users.json','utf-8');

    // converter os dados para arrays
    const Users = JSON.parse(dexist);

    //verificar se o email ja existe
    const emailproc = Users.find((proc)=> email === proc.email );
    if (emailproc) {
    return res.status(409).json({ mensagem: 'Email ja cadastrado' });
    }

    //criptografar a senha
    const senhasafe = await bcrypt.hash(password, 10);    
    // atualizando os dados para que o newUser os receba
    const  newUser = {
    ...req.body, //os 3 pontos significam spread, usados para criar copias de objectos ou arrays
    password : senhasafe
    }

    //adicionar os dados no fim do array
    Users.push(newUser);
    
    //gravar os dados atualizados
    fs.writeFileSync('./data/users.json', JSON.stringify(Users, null, 2));

    //resposta
     res.status(201).send("Utilizador guardado com sucesso!");
})

//============================cadastro do estudante===========================//
router.post('/cadastro/estudante', async (req,res)=> {

    // dados recebidos do formulario
    const { nome,email,contacto,curso,media_ensinomedio,password } = req.body;

    //verificar se os dados estao vazios
    if(!nome || !email || !contacto || !curso || !media_ensinomedio || !password){
        return res.status(400).json({
            mensagem: 'Preenche todos os campos.'
        });
    }

    //verificar se o email esta correcto
       if (!email.includes('@')) {
        return res.status(400).json({
            mensagem: 'O email não é válido.'
        });
    }

    //verificar se o numero esta correcto
    if(!/^9\d{8}$/.test(String(contacto))){
        return res.status(400).json
        ({
            mensagem: "O contacto deve começar com 9 e ter exatamente 9 dígitos"
        });
    }

    //ler os dados que estao ficheiro json
    const dexist = fs.readFileSync('./data/users.json','utf-8');

    // converter os dados para arrays
    const Users = JSON.parse(dexist);

    //verificar se o email ja existe
    const emailproc = Users.find((proc)=> email === proc.email );
    if (emailproc) {
    return res.status(409).json({ mensagem: 'Email ja cadastrado' });
    }

    //criptografar a senha
    const senhasafe = await bcrypt.hash(password, 10);    
    // atualizando os dados para que o newUser os receba
    const  newUser = {
    ...req.body, //os 3 pontos significam spread, usados para criar copias de objectos ou arrays
    tipo: 'estudante',
    password : senhasafe
    }

    //adicionar os dados no fim do array
    Users.push(newUser);
    
    //gravar os dados atualizados
    fs.writeFileSync('./data/users.json', JSON.stringify(Users, null, 2));

    //resposta
     res.status(201).send("Estudante cadastrado com sucesso!");
})

export default router;


import bcrypt from 'bcrypt';// serve para proteger a password no momento do cadastro
import {
    buscarEmail,
    guardarUser
} from '../repositories/userRepositories.js'
import jwt from 'jsonwebtoken'; //

//=============cadastro do mentor==================================================//

export async function cadastroMentor ( nome,email,contacto, formacao,password){

     //verificar se os dados estao vazios
    if(!nome || !email || !contacto || !formacao || !password){
        const erro = new Error ('Preencha todos os campos');
        erro.statusCode = 400;
        throw erro;
    }

    //verificar se o email esta correcto
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const erro = new Error('Email inválido');
        erro.statusCode = 400;
        throw erro;
    }

    //verificar se o email ja existe
        const emailExistente = buscarEmail(email);
         if (emailExistente) {
         const erro = new Error ("O Email já se encontra cadastro, use outro.");
            erro.statusCode = 409;
            throw erro;
        }
    
    //verificar se o contacto esta correcto
    if(!/^9\d{8}$/.test(String(contacto))){
        const erro = new Error ('"O contacto deve começar com 9 e ter exatamente 9 dígitos"');
        erro.statusCode = 400;
        throw erro;
    }

    //criptografar a senha
    const senhasafe = await bcrypt.hash(password, 10); 

    // atualizando os dados para que o newUser os receba
            const newUser = {
            nome: nome,
            email: email,
            contacto:contacto,
            formacao: formacao,
            tipo: "Mentor",
            password: senhasafe

        }

        guardarUser(newUser);

    return `${newUser.email} cadastrado(a) como Mentor com sucesso`;
}
   
//======================estudante================================================================//

  export async function cadastroEstudante(nome,email,contacto,curso,media_ensinomedio,password) {
    
        if(!nome || !email || !contacto || !curso || !media_ensinomedio || !password){
            const erro = new Error ('Preencha todos os campos');
            erro.statusCode = 400;
            throw erro;
        }

        const media = Number(media_ensinomedio);

        if (!Number.isFinite(media) || media < 0 || media > 20) {
            const erro = new Error('A média deve ser um número entre 0 e 20');
            erro.statusCode = 400;
            throw erro;
        }
    
        //verificar se o email esta correcto
         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const erro = new Error('Email inválido');
        erro.statusCode = 400;
        throw erro;
    }
    
        //verificar se o email ja existe
        const emailExistente = buscarEmail(email);
         if (emailExistente) {
         const erro = new Error ("O Email já se encontra cadastro, use outro.");
            erro.statusCode = 409;
            throw erro;
        }

        //verificar se o numero esta correcto
        if(!/^9\d{8}$/.test(String(contacto))){
            const erro = new Error ('"O contacto deve começar com 9 e ter exatamente 9 dígitos"');
            erro.statusCode = 400;
            throw erro;
        }
    
        //criptografar a senha
        const senhasafe = await bcrypt.hash(password, 10);    

        // atualizando os dados para que o newUser os receba, criando um objecto
        const newUser = {
            nome: nome,
            email: email,
            contacto:contacto,
            curso: curso,
            media_ensinomedio: media_ensinomedio,
            tipo: "estudante",
            password: senhasafe

        }

        guardarUser(newUser);
        
        return `Estudante ${newUser.email} cadastrado com sucesso`;
  }


//=============================== LOGIN ========================================//

    export async function login(email, password){

        //verificacao do email
         const emailExistente = buscarEmail(email);
         if (!emailExistente) {
         const erro = new Error ("Este email nao esta cadastrado no sistema ");
            erro.statusCode = 409;
            throw erro;
        }

        // comparacao de senhas 
       const verifPass = await bcrypt.compare(password, emailExistente.password);
       if(!verifPass){
            const erro = new Error ("Password Incorrecta");
            erro.statusCode = 401;
            throw erro;
       }

       //criando um token
       const token = jwt.sign(// cria e assina o token
        {
            email: emailExistente.email, // identifica o user
            tipo: emailExistente.tipo //permite distinguir mentor de estudante 
        },
        process.env.JWT_SECRET,//usa a chave guardada no .env
        {expiresIn:'1h'} // tempo de validade do token

       );

       return  {
        mensagem: "Seja Bem-Vindo de volta",
        nome: emailExistente.nome,
        token: token
       };
    } 



    
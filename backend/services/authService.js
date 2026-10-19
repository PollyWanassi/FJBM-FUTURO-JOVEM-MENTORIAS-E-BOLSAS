//=============cadastro do mentor====================//

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

    //verificar se o contacto esta correcto
    if(!/^9\d{8}$/.test(String(contacto))){
        return res.status(400).json
        ({
            mensagem: "O contacto deve começar com 9 e ter exatamente 9 dígitos"
        });
    }

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

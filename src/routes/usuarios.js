require("dotenv").config();
const express = require("express");
const usuarios = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const usuariosRepository = require("../repositories/usuarios.repository");

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.CODIGO_EMAIL
    }
});

usuarios.get("/", async (req, res) => {
    try {
        const todosUsuarios = await usuariosRepository.listarUsuarios();
        res.status(200).json(todosUsuarios);
    } catch (error) {
        console.log(error);
        res.status(500).json({erro: "Erro ao buscar usuários."});
    }
});

usuarios.post("/cadastro", async(req, res)=>{
    try {
        const {nome, matricula, email, senha} = req.body;
        
        if(!nome || !matricula || !email || !senha){
            return res.status(400).json({erro: "Preencha todos os campos."});
        }

        const usuarioExistente = await usuariosRepository.buscarUsuarioPorEmailOuMatricula(email, matricula);
        
        if(usuarioExistente.length > 0){
            return res.status(400).json({erro: "Ocorreu um erro, tente novamente."});
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuarioCriado = await usuariosRepository.cadastrarUsuario(nome, matricula, email, senhaCriptografada);

        res.status(201).json({
            mensagem: "Usuario cadastrado com sucesso!",
            usuario: usuarioCriado
        });
        
    } catch (error) {
         console.error(error);
        res.status(500).json({
            erro: "Erro ao cadastrar usuário."
        });
    }
});

usuarios.post("/login", async (req, res) => {
    try {
        const {email, senha} = req.body;

        if(!email || !senha){
             return res.status(400).json({
                erro: "E-mail e senha são obrigatórios."
            });
        }

        const usuario = await usuariosRepository.buscarUsuarioPorEmail(email);

        if (!usuario) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        }

         const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nome: usuario.nome,
                id_perfil: usuario.id_perfil
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        await usuariosRepository.atualizarTokenSessao(usuario.id_usuario, token);

        res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: usuario.id_usuario, 
                nome: usuario.nome,
                email: usuario.email,
                id_perfil: usuario.id_perfil
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao realizar login."
        });
    }
});

usuarios.post("/solicitarRecuperacao", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                erro: "Informe o e-mail."
            });
        }

        const usuario = await usuariosRepository.buscarUsuarioPorEmail(email);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracao = new Date(Date.now() + 15 * 60 * 1000);

        await usuariosRepository.salvarCodigoRecuperacao(email, codigo, expiracao);

        await transporter.sendMail({
            from: "luiseduardodevv@gmail.com",
            to: email,
            subject: "Recuperação de Senha",
            text: `Seu código de recuperação é: ${codigo}\n\nEsse código é válido por 15 minutos.`
        });

        res.status(200).json({
            mensagem: "Código enviado com sucesso."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao enviar o e-mail."
        });
    }
});

usuarios.put("/redefinir", async (req, res) => {
    try {
        const { email, codigo, senha } = req.body;

        if (!email || !codigo || !senha) {
            return res.status(400).json({
                erro: "Informe o e-mail, o código e a nova senha."
            });
        }

        const usuario = await usuariosRepository.buscarUsuarioPorEmail(email);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        if (usuario.codigo_recuperacao !== codigo) {
            return res.status(400).json({
                erro: "Código inválido."
            });
        }

        if (new Date() > usuario.codigo_expiracao) {
            return res.status(400).json({
                erro: "O código expirou."
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await usuariosRepository.redefinirSenha(usuario.id_usuario, senhaCriptografada);

        res.status(200).json({
            mensagem: "Senha redefinida com sucesso."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao redefinir a senha."
        });
    }
});

usuarios.put("/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, matricula, email } = req.body;

        const usuarioAtualizado = await usuariosRepository.atualizarUsuario(id, nome, matricula, email);

        if (!usuarioAtualizado) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario: usuarioAtualizado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao atualizar usuário."
        });
    }
});

usuarios.delete("/delete/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const usuarioDeletado = await usuariosRepository.deletarUsuario(id);

        if(!usuarioDeletado){
            return res.status(404).json({erro: "Usuário não encontrado."});
        }

        res.status(200).json({
            mensagem: "Usuário excluído com sucesso!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao excluir usuário."
        });
    }
});

module.exports = usuarios;
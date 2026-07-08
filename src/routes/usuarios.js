require("dotenv").config();
const express = require("express");
const usuarios = express.Router();
const pool = require("../db/conexao");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { verificarToken } = require("../middlewares/auth");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.CODIGO_EMAIL
    }
});

usuarios.get("/", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT * FROM usuarios");

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({erro: "Error ao buscar usuários."})
    }
});

usuarios.post("/cadastro", async(req, res)=>{
    try {
        const {nome, matricula, email, senha} = req.body;
        
        if(!nome || !matricula || !email || !senha){
            return res.status(400).json({erro: "Preencha todos os campos."});
        };

        const usuarioExistente = await pool.query("SELECT * FROM usuarios WHERE email = $1 OR MATRICULA = $2", 
        [email, matricula]);
        
        if(usuarioExistente.rows.length > 0){
            return res.status(400).json({erro: "Ocorreu um erro, tente novamente."})
        };

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(
            `INSERT INTO usuarios (nome, matricula, email, senha) VALUES ($1, $2, $3, $4)
            RETURNING id_usuario, nome, matricula, email `, [nome, matricula, email, senhaCriptografada]
        );

        res.status(201).json({mensagem: "Usuario cadastrado com sucesso!",
            usuario: resultado.rows[0]
        });
        
    } catch (error) {
         console.error(error);
        res.status(500).json({
            erro: "Erro ao cadastrar usuário."
        });
    };
});

usuarios.post("/login", async (req, res) => {
    try {
        const {email, senha} = req.body;

        if(!email || !senha){
             return res.status(400).json({
                erro: "E-mail e senha são obrigatórios."
            });
        };

        const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        };

        const usuario = resultado.rows[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "E-mail ou senha inválidos."
            });
        };

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

        await pool.query(
            "UPDATE usuarios SET token_sessao = $1 WHERE id_usuario = $2",
            [token, usuario.id_usuario]
        );

        res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: usuario.id,
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

        const resultado = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        const expiracao = new Date(Date.now() + 15 * 60 * 1000);

        console.log(codigo);
        console.log(expiracao);
        console.log(email);

        const update = await pool.query(
            `UPDATE usuarios
            SET codigo_recuperacao = $1,
                codigo_expiracao = $2
            WHERE email = $3
            RETURNING *`,
            [codigo, expiracao, email]
        );

        console.log(update.rows);

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

        const resultado = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        const usuario = resultado.rows[0];

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

        await pool.query(
            `UPDATE usuarios
             SET senha = $1,
                 codigo_recuperacao = NULL,
                 codigo_expiracao = NULL
             WHERE id_usuario = $2`,
            [senhaCriptografada, usuario.id_usuario]
        );

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

usuarios.put("editar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, matricula, email } = req.body;

        const resultado = await pool.query(
            `UPDATE usuarios
             SET nome = $1,
                 matricula = $2,
                 email = $3
             WHERE id_usuario = $4
             RETURNING *`,
            [nome, matricula, email, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao atualizar usuário."
        });
    }
});

usuarios.delete("delete/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const resultado = await pool.query("DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", [id]);

        if(resultado.rows.length === 0){
            return res.status(404).json({erro: "Usuário não encontrado."});
        };

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
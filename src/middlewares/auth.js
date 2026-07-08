const jwt = require("jsonwebtoken");
const pool = require("../db/conexao"); 

async function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: "Token não informado"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const resultado = await pool.query("SELECT token_sessao FROM usuarios WHERE id_usuario = $1", [decoded.id]);
        
        if (resultado.rows.length === 0 || resultado.rows[0].token_sessao !== token) {
            return res.status(401).json({
                erro: "Sessão encerrada: Sua conta realizou login em outro dispositivo.",
                derrubarSessao: true 
            });
        }

        req.usuario = decoded;
        next();

    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado"
        });
    }
}

function autorizarPerfis(perfisPermitidos) {
    return (req, res, next) => {
        const idPerfilUsuario = req.usuario.id_perfil; 

        if (!perfisPermitidos.includes(idPerfilUsuario)) {
            return res.status(403).json({ 
                erro: "Acesso Negado: Seu perfil não tem permissão para realizar esta ação." 
            });
        }
        
        next(); 
    };
}

module.exports = { verificarToken, autorizarPerfis };
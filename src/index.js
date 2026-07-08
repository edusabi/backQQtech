require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const usuarios = require("./routes/usuarios");
const perfil = require("./routes/perfil");
const lojas = require("./routes/lojas");
const taloes = require("./routes/taloes");
const relatorios = require("./routes/relatorios");
const estoque = require("./routes/estoque");
const cors = require("cors");
const pool = require("./db/conexao");

app.use(cors());

app.use(express.json());

app.use("/perfil", perfil);
app.use("/usuarios", usuarios);
app.use("/lojas", lojas);
app.use("/taloes", taloes);
app.use("/relatorios", relatorios);
app.use("/estoque", estoque);

app.get("/health", (req, res)=>{
    res.send("Rodando...");
});

app.listen(3000, ()=>{
    console.log("backend rodando...")
});
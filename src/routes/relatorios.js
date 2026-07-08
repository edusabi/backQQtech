const express = require("express");
const relatorios = express.Router();
const pool = require("../db/conexao");
const axios = require("axios"); 

relatorios.get("/gerar-insight", async (req, res) => {
});

relatorios.get("/exportar/:tipo", async (req, res) => {
});

module.exports = relatorios;
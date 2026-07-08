const express = require("express");
const taloes = express.Router();
const pool = require("../db/conexao");
const axios = require('axios');

taloes.post("/", async (req, res) => {
});

taloes.get("/", async (req, res) => {
});

taloes.post("/receber", async (req, res) => {
});

taloes.get("/receber", async (req, res) => {
});

taloes.post("/manutencao", async (req, res) => {
});

taloes.get("/manutencao/historico", async (req, res) => {
});

taloes.put("/manutencao/:id", async (req, res) => {
});

taloes.delete("/manutencao/:id", async (req, res) => {
});

taloes.get("/estoque/lojas", async (req, res) => {
});

taloes.put("/estoque/ajuste", async (req, res) => {
});

taloes.get("/exportar/csv", async (req, res) => {
});

taloes.post("/estoque/ia-previsao", async (req, res) => {
});

taloes.get("/envio/ia-prioridade", async (req, res) => {
});

taloes.get("/receber/ia-anomalias", async (req, res) => {
});

taloes.get("/relatorios/gerar-insight", async (req, res) => {
});

taloes.get("/relatorios/exportar-estoque", async (req, res) => {
});

taloes.get("/dashboard/ia-indicadores", async (req, res) => {
});

taloes.post("/dashboard/chat", async (req, res) => {
});

module.exports = taloes;
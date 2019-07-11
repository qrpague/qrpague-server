const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const EfetivacaoOperacao = {
    operacaoEfetivada: { type: Boolean, required: true },
    dataHoraEfetivacao:  { type: Date, required: true }
}

module.exports = { EfetivacaoOperacao };
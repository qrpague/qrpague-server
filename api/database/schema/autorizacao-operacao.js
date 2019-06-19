const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const AutorizacaoOperacao = {
    operacaoAutorizada: { type: Boolean, required: true },
    dataHoraAutorizacao:  { type: Date, required: true },
    dispositivoConfirmacao: {type: TerminalSchema, required: true }
}

module.exports = { AutorizacaoOperacao };
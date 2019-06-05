const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const AutorizacaoOperacaoSchema = {
    operacaoAutorizada: { type: Boolean, required: true, unique: true },
    dataHoraAutorizacao:  { type: Date, required: true, default: Date.now() },
    dispositivoConfirmacao: {type: TerminalSchema, required: true }
}

module.exports = { AutorizacaoOperacaoSchema };
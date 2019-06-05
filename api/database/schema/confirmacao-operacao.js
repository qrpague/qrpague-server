const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const ConfirmacaoOperacaoSchema = {
    operacaoConfirmada: { type: Boolean, required: true, unique: true },
    dataHoraConfirmacao:  { type: Date, required: true, default: Date.now() },
    dispositivoConfirmacao: {type: TerminalSchema, required: true }
}

module.exports = { ConfirmacaoOperacaoSchema };
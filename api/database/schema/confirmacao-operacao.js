const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const ConfirmacaoOperacao = {
    operacaoConfirmada: { type: Boolean, required: true },
    dataHoraConfirmacao:  { type: Date, required: true },
    // dispositivoConfirmacao: {type: TerminalSchema, required: true }
}

module.exports = { ConfirmacaoOperacao };
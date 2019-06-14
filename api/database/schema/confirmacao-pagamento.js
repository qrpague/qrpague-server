const { Schema } = require('mongoose');
const { Terminal } = require('./terminal')

const TerminalSchema = new Schema(Terminal, { _id: false })

const ConfirmacaoPagamento = {
    pagamentoConfirmado: { type: Boolean, required: true },
    dataHoraConfirmacao:  { type: Date, required: true },
    dispositivoConfirmacao: {type: TerminalSchema, required: true }
}

module.exports = { ConfirmacaoPagamento };
const { Schema } = require('mongoose');
const { Terminal } = require('./terminal');
const { Pessoa } = require('./pessoa');
const { Item } = require('./item');
const { Pagamento } = require('./pagamento');
const { ConfirmacaoOperacao } = require('./confirmacao-operacao');
const { AutorizacaoOperacao } = require('./autorizacao-operacao');

const TIPO_OPERACAO = {
    SAQUE : 'SAQUE',
    TRANSFERENCIA: 'TRANSFERENCIA',
    VENDA: 'VENDA'
}
const ARRAY_TIPO_OPERACAO = Object.values(TIPO_OPERACAO);

const SITUACAO = {
    EMITIDO: 'EMITIDO',
    PAGO: 'PAGO',
    PAGO_PARCIALMENTE: 'PAGO_PARCIALMENTE',
    AUTORIZADO: 'AUTORIZADO',
    CONFIRMADO: 'CONFIRMADO',
    CANCELADO: 'CANCELADO'
}
const ARRAY_SITUACAO = Object.values(SITUACAO);

const TerminalSchema = new Schema(Terminal, { _id: false })
const PessoaSchema = new Schema(Pessoa, { _id: false })
const ItemSchema = new Schema(Item, { _id: false })
const PagamentoSchema = new Schema(Pagamento, { _id: false })
const ConfirmacaoOperacaoSchema = new Schema(ConfirmacaoOperacao, { _id: false })
const AutorizacaoOperacaoSchema = new Schema(AutorizacaoOperacao, { _id: false })

const OperacaoSchema = {
    versao: { type: Number, required: true },
    cnpjInstituicao:  { type: String, required: true },
    valor: {type: Number, required: true },
    dataHoraSolicitacao: {type: Date, required: true, default: Date.now()},
    tipoOperacao: {type: String, required: true, enum: ARRAY_TIPO_OPERACAO},
    situacao: {type: String, required: true, enum: ARRAY_SITUACAO},
    terminal: {type: TerminalSchema, required: true},
    beneficiario: {type: PessoaSchema, required: true},

    uuid: { type: String, required: false, unique: true },
    descricao: {type: String, required: false },
    dataHoraVencimento: {type: Date, required: false},
    dataHoraEfetivacao: {type: Date, required: false},
    exigeEndereco: {type: Boolean, required: false},
    pagamentoParcial: {type: Boolean, required: false},
    exigeEmail: {type: Boolean, required: false},
    itens: [ItemSchema],
    pagamentos: [PagamentoSchema],
    confirmacaoOperacao: {type: ConfirmacaoOperacaoSchema, required: false },
    autorizacaoOperacao: {type: AutorizacaoOperacaoSchema, required: false },
}

module.exports = { OperacaoSchema, TIPO_OPERACAO, SITUACAO };
const { Schema } = require('mongoose');
const { Pessoa } = require('./pessoa');
const { ConfirmacaoOperacao } = require('./confirmacao-operacao');
const { AutorizacaoOperacao } = require('./autorizacao-operacao');

const SITUACAO = {
    REALIZADO: 'REALIZADO',
    CONFIRMADO: 'CONFIRMADO',
    CANCELADO: 'CANCELADO'
}
const ARRAY_SITUACAO = Object.values(SITUACAO);

const PessoaSchema = new Schema(Pessoa, { _id: false })
const ConfirmacaoOperacaoSchema = new Schema(ConfirmacaoOperacao, { _id: false })
const AutorizacaoOperacaoSchema = new Schema(AutorizacaoOperacao, { _id: false })

const PagamentoSchema = {
    uuid: { type: Number, required: true, unique: true },
    dataHoraPagamento: {type: Date, required: true, default: Date.now() },
    pagador: { type: PessoaSchema, required: true },
    valor: {type: Number, required: true },
    situacao: {type: String, required: true, enum: ARRAY_SITUACAO },

    chavePublicaInstituicao:  { type: String, required: false },
    cnpjInstituicao: {type: String, required: false },
    confirmacaoOperacao: {type: ConfirmacaoOperacaoSchema, required: false },
    autorizacaoOperacao: {type: AutorizacaoOperacaoSchema, required: false },
}


module.exports = { PagamentoSchema, SITUACAO };
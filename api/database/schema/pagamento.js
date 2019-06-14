const { Schema } = require('mongoose');
const { Pessoa } = require('./pessoa');
const { ConfirmacaoPagamento } = require('./confirmacao-pagamento');

const SITUACAO = {
    REALIZADO: 'REALIZADO',
    CONFIRMADO: 'CONFIRMADO',
    CANCELADO: 'CANCELADO'
}
const ARRAY_SITUACAO = Object.values(SITUACAO);

const PessoaSchema = new Schema(Pessoa, { _id: false });
const ConfirmacaoPagamentoSchema = new Schema(ConfirmacaoPagamento, { _id: false });

const Pagamento = {
    uuid: { type: String, required: true, unique: true },
    cnpjInstituicao: { type: String, required: true },
    chavePublicaInstituicao:  { type: String, required: true },
    dataHoraPagamento: {type: Date, required: true },
    pagador: { type: PessoaSchema, required: true },
    valor: {type: Number, required: true },
    situacao: {type: String, required: true, enum: ARRAY_SITUACAO },

    confirmacaoPagamento: { type: ConfirmacaoPagamentoSchema, required: false },
}


module.exports = { Pagamento, SITUACAO };
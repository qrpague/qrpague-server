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

const UUID_PATTERN = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/;

const Pagamento = {
    uuid: { type: String, required: true, unique: true },
    uuidOperacaoFinanceira: { type: String, required: true },
    cnpjInstituicao: { type: String, required: true },
    dataHoraPagamento: {type: Date, required: true },
    pagador: { type: PessoaSchema, required: true },
    valor: {type: Number, required: true },
    situacao: {type: String, required: true, enum: ARRAY_SITUACAO },

    idRequisicao: { 
        type: String,
        required: false,
        unique: true,
        sparse: true,
        validate: {
            validator: (field) => UUID_PATTERN.test(field),
            message: (props) => `O campo ${props.path} não está seguindo o padrão ${UUID_PATTERN}`
        }
    },
    confirmacaoPagamento: { type: ConfirmacaoPagamentoSchema, required: false },
}


module.exports = { Pagamento, SITUACAO };
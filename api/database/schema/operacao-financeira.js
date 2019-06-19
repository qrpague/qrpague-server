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

const UUID_PATTERN = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/;

const Operacao = {
    uuid: { 
        type: String,
        required: [true, 'O campo uuid é obrigatório'],
        unique: true,
        validate: {
            validator: (field) => UUID_PATTERN.test(field),
            message: (props) => `O campo ${props.path} - ${props.value} não está seguindo o padrão ${UUID_PATTERN}.`
        }
    },
    versao: { 
        type: Number,
        required: [true, 'O campo versao é obrigatório'] 
    },
    cnpjInstituicao:  { 
        type: String,
        required: [true, 'O campo cnpjInstituicao é obrigatório'] 
    },
    valor: { 
        type: Number,
        required: [true, 'O campo valor é obrigatório']  
    },
    dataHoraSolicitacao: { 
        type: Date,
        required: [true, 'O campo dataHoraSolicitacao é obrigatório'],
    },
    dataHoraVencimento: {
        type: Date,
        required: [true, 'O campo dataHoraVencimento é obrigatório']
    },
    tipoOperacao: {
        type: String,
        required: [true, 'O campo tipoOperacao é obrigatório'],
        enum: ARRAY_TIPO_OPERACAO
    },
    situacao: { 
        type: String,
        required: [true, 'O campo situacao é obrigatório'],
        enum: ARRAY_SITUACAO,
        default: SITUACAO.EMITIDO 
    },
    terminal: {
        type: TerminalSchema,
        required: [true, 'O campo terminal é obrigatório'],
    },
    beneficiario: {
        type: PessoaSchema,
        required: [true, 'O campo beneficiario é obrigatório'],
    },

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
    descricao: {
        type: String,
        required: false 
    },
    dataHoraEfetivacao: {
        type: Date,
        required: false
    },
    exigeEndereco: {
        type: Boolean,
        required: false
    },
    pagamentoParcial: {
        type: Boolean,
        required: false
    },
    exigeEmail: {
        type: Boolean,
        required: false
    },
    confirmacaoOperacao: {
        type: ConfirmacaoOperacaoSchema,
        required: false 
    },
    autorizacaoOperacao: {
        type: AutorizacaoOperacaoSchema,
        required: false 
    },
    itens: [ ItemSchema ],
    pagamentos: [{ type: Schema.ObjectId, ref: 'Pagamento' }],
}

module.exports = { Operacao, TIPO_OPERACAO, SITUACAO };
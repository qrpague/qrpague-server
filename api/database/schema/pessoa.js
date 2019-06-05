const { Schema } = require('mongoose');
const { Endereco } = require('./endereco')

const TIPO_CONTA = {
    CCO : 'CCO',
    POUP: 'POUP'
}
const ARRAY_TIPO_CONTA = Object.values(TIPO_CONTA);

const EnderecoSchema = new Schema(Endereco, { _id: false })

const PessoaSchema = {
    nome: { type: String, required: true },
    cpfCnpj:  { type: String, required: true, unique: true },
    instituicao: {type: String, required: true },

    agencia: {type: String, required: false },
    conta: {type: String, required: false },
    operacao: {type: String, required: false },
    tipoConta: {type: String, required: false, enum: ARRAY_TIPO_CONTA },
    endereco: { type: EnderecoSchema, required: false },
}

module.exports = { PessoaSchema, TIPO_CONTA };
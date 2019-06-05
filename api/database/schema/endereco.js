const { UF, ARRAY_UF } = require('../enum/uf');

const EnderecoSchema = {
    logradouro: { type: String, required: false },
    complemento:  { type: String, required: false },
    uf: { type: String, required: false, enum: ARRAY_UF },
    bairro: {type: String, required: false },
    localidade: {type: String, required: false },
    valorUnitario: {type: Number, required: false },
    cep: {type: String, required: false }
}

module.exports = { EnderecoSchema, UF };
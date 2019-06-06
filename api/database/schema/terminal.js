const { ARRAY_UF } = require('../enum/uf');

const TerminalSchema = {
    idTerminal: { type: Number, required: true, unique: true },
    descricao:  { type: String, required: true },
    uf: { type: String, required: true, enum: ARRAY_UF },
    cep: {type: String, required: true },
    latitudeTerminal: {type: Number, required: true },
    longitudeTerminal: {type: Number, required: true }
}

module.exports = { TerminalSchema };
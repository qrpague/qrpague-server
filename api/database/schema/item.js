const Item = {
    descricaoCompleta: { type: String, required: true },
    quantidade: { type: Number, required: true },
    valorUnitario: {type: Number, required: true },
    total: { type: Number, required: true },

    descricao48: { type: String, required: false },
    codigo: { type: String, required: false },
    desconto: { type: Number, required: false },
    urlThumbImg: { type:String, required: false }
}

module.exports = { Item };

module.exports = function (message, codigo) {
    return {
        sucessoOperacao: false,
        codigoErro: codigo || 400,
        mensagemErro: message,
        dataReferencia: new Date(),
    }

}
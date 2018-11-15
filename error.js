exports = {

    enviarErro: function (msg) {
        res.status(400).send(
            montaErro(msg));
    },


}

function montaErro(msg) {
    var erro = {
        sucessoOperacao: false,
        mensagemErro: msg,
        dataReferencia: new Date()
    }
    return erro;
}
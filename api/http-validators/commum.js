const { ResponseError, Err, Response } = require('../util');

const campoObrigatorio = (nomeCampo, valor, options = { isRequest: true }) => {
    const tipo = typeof valor;
    if(tipo === 'number' && valor === 0) {
        return;
    }
    if(tipo !== 'boolean' && !valor){
        if(options.isRequest) {
            Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000, 1, { campo: nomeCampo });
        } else {
            Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 998000, 1, { campo: nomeCampo });
        }
    }
}

module.exports = {
    campoObrigatorio
}
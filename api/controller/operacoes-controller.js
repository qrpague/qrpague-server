const { Response } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');

const WHATSAPP = 'WHATSAPP';

const criarOperacao = async (req, res, next) => {
    try {
        const tipo = req.headers.accept;
	    const operacaoFinanceira = req.body;
        const result = await service.criarOperacao({ tipo, operacaoFinanceira });
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.JSON });
    } catch (err) {
        return Response.fromResponseError(res, err);
    }
}

const consultarOperacoes = (req, res, next) => {
    try {
	    const options = paramUtil.getParams(req);
        const result = await service.consultarOperacoes(options);
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const consultarOperacao = (req, res, next) => {
    try {
        const isWhatsApp = req.headers['user-agent'] === WHATSAPP ? true : false;
        const params = paramUtil.getParams(req);
        const options = { ...params, isWhatsApp }
        
        const result = await service.consultarOperacao(options);

        if(!isWhatsApp) {
            return Response.success(res, result, { contentType: Response.CONTENT_TYPE.XHTML });
        } else {
            return Response.success(res, result, { contentType: Response.CONTENT_TYPE.QR_PAGUE });
        }
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const autorizarOperacao = (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const autorizacao = req.body;
        const result = await service.autorizarOperacao({ uuid, autorizacao});

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const confirmarOperacao = (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const confirmacao = req.body;
        const result = await service.receber({ uuid, confirmacao});

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

module.exports = {
    criarOperacao,
    consultarOperacoes,
    consultarOperacao,
    autorizarOperacao,
    confirmarOperacao
};
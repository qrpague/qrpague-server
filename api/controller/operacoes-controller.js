const { Response } = require('@sfd-br/util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');

const WHATSAPP = 'WHATSAPP';

const criarOperacao = async (req, res, next) => {
    try {
        const tipo = req.headers.accept;
	    const operacaoFinanceira = req.body;
        const result = await service.criarOperacao({ tipo, operacaoFinanceira });
        return Response.success(res, result);
    } catch (err) {
        return Response.error(res, err);
    }
}

const consultarOperacoes = (req, res, next) => {
    try {
	    const options = paramUtil.getParams(req);
        const result = await service.consultarOperacoes(options);
        return Response.success(res, result);
    } catch (err) {
        return Response.error(res, err);
    }
}

const consultarOperacao = (req, res, next) => {
    try {
        const isWhatsApp = req.headers['user-agent'] === WHATSAPP ? true : false;
        const params = paramUtil.getParams(req);
        const options = { ...params, isWhatsApp }
        
        const result = await service.consultarOperacao(options);

        if(!isWhatsApp) {
            res.setHeader('Content-Type', 'application/xhtml+xml');
        } else {
            res.setHeader('Content-Type', 'application/qrpague');
        }
        return res.status(200).send(result);
    } catch (err) {
        return Response.error(res, err);
    }
}

const autorizarOperacao = (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const autorizacao = req.body;
        const result = await service.autorizarOperacao({ uuid, autorizacao});

        res.setHeader('Content-Type', ['application/qrpague']);
        return res.status(200).send(result);
    } catch (err) {
        return Response.error(res, err);
    }
}

const confirmarOperacao = (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const confirmacao = req.body;
        const result = await service.receber({ uuid, confirmacao});

        res.setHeader('Content-Type', ['application/qrpague']);
        return res.status(200).send(result);
    } catch (err) {
        return Response.error(res, err);
    }
}

module.exports = {
    criarOperacao,
    consultarOperacoes,
    consultarOperacao,
    autorizarOperacao,
    confirmarOperacao
};
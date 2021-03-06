const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');
const OperacaoValidator = require('../http-validators/operacoes-validator');

const WHATSAPP = 'WHATSAPP';

const criarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const tipo = params.accept;
        const contentType = (tipo === Response.CONTENT_TYPE.APPLICATION_IMAGE) ? tipo : Response.CONTENT_TYPE.TEXT_PLAIN;
        const body = req.body;
        const operacaoFinanceira = OperacaoValidator.requisicaoCriarOperacao(params, body);
        const resposta = await service.criarOperacao({ contentType, operacaoFinanceira });
        return Response.created(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const alterarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = OperacaoValidator.requisicaoAlterarOperacao(params, body);
        const resposta = await service.alterarOperacao(options);
        return Response.success(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const consultarOperacoes = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = OperacaoValidator.requisicaoConsultarOperacoes(params, body);
        const resposta = await service.consultarOperacoes(options);
        return Response.success(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const consultarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = OperacaoValidator.requisicaoConsultarOperacao(params, body);
        const resposta = await service.consultarOperacao(options);
        return Response.success(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const efetivarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const body = req.body;
        const options = OperacaoValidator.requisicaoEfetivarOperacao(params, body);
        await service.efetivarOperacao(options);
        return Response.noContent(res, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const confirmarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const body = req.body;
        const options = OperacaoValidator.requisicaoConfirmarOperacao(params, body);
        await service.confirmarOperacao(options);
        return Response.noContent(res, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

module.exports = {
    criarOperacao,
    consultarOperacoes,
    consultarOperacao,
    efetivarOperacao,
    confirmarOperacao,
    alterarOperacao
};
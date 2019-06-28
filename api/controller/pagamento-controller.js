const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/pagamento-service');

const WHATSAPP = 'WHATSAPP';

const criarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const pagamento = req.body;
        const tokenInstituicao = params['token-instituicao'];
        const uuidOperacao = params.uuid;

        const result = await service.criarPagamento({ tokenInstituicao, uuidOperacao, pagamento });
        const contentType = Response.CONTENT_TYPE.APPLICATION_JSON;
        Response.created(res, result, { contentType });
    } catch (err) {
        Logger.warn(err);
        Response.fromError(res, err);
    }
}

const consultarPagamentos = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const tokenInstituicao = params['token-instituicao'];
        const options = { ...params, tokenInstituicao }

        const result = await service.consultarPagamentos(options);
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const consultarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const tokenInstituicao = params['token-instituicao'];
        const options = { ...params, tokenInstituicao }
        
        const result = await service.consultarPagamento(options);

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const confirmarPagamento = async (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const confirmacao = req.body;
        const result = await service.confirmarPagamento({ uuid, confirmacao});

        return Response.noContent(res, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

module.exports = {
    criarPagamento,
    consultarPagamentos,
    consultarPagamento,
    confirmarPagamento
};
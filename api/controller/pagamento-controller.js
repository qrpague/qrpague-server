const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/pagamento-service');
const PagamentoValidator = require('../http-validators/pagamento-validator');

const criarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const body = req.body;
        const options = PagamentoValidator.requisicaoCriarPagamento(params, body);
        const resposta = await service.criarPagamento(options);
        return Response.created(res, resposta, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const consultarPagamentos = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = PagamentoValidator.requisicaoConsultarPagamentos(params, body);
        const resposta = await service.consultarPagamentos(options);
        return Response.success(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const consultarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = PagamentoValidator.requisicaoConsultarPagamento(params, body);
        const resposta = await service.consultarPagamento(options);
        return Response.success(res, resposta, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const confirmarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const contentType = params['content-type'] === Response.CONTENT_TYPE.APPLICATION_QR_PAGUE ? Response.CONTENT_TYPE.APPLICATION_QR_PAGUE : Response.CONTENT_TYPE.APPLICATION_JSON;
        const body = req.body;
        const options = PagamentoValidator.requisicaoConfirmarPagamento(params, body);
        const resposta = await service.confirmarPagamento(options);
        return Response.noContent(res, { contentType });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

module.exports = {
    criarPagamento,
    consultarPagamentos,
    consultarPagamento,
    confirmarPagamento
};
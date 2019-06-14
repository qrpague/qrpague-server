const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/pagamento-service');

const WHATSAPP = 'WHATSAPP';

const criarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
	    const pagamento = req.body;
        const result = await service.criarPagamento({ uuidOperacao: params.uuid,  pagamento });
        Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        Logger.warn(err);
        Response.fromError(res, err);
    }
}

const consultarPagamentos = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const options = { ...params, cnpjInstituicao: params.cnpjinstituicao }
        const result = await service.consultarPagamentos(options);
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const consultarPagamento = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const options = { ...params, cnpjInstituicao: params.cnpjinstituicao }
        
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
        const result = await service.receber({ uuid, confirmacao});

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
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
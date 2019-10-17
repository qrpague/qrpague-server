const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/beneficiario-service');
const BeneficiarioValidator = require('../http-validators/beneficiario-validator');

const consultarBeneficiarios = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const options = BeneficiarioValidator.requisicaoConsultarBeneficiarios(params);
        const resposta = await service.consultarBeneficiarios(options);
        return Response.success(res, resposta, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

const consultarBeneficiario = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const options = BeneficiarioValidator.requisicaoConsultarBeneficiario(params);
        const resposta = await service.consultarBeneficiario(options);
        return Response.success(res, resposta, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        Logger.warn(err);
        return Response.fromError(res, err);
    }
}

module.exports = {
    consultarBeneficiarios,
    consultarBeneficiario
};
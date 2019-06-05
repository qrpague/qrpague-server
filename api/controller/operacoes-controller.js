const { Response } = require('@sfd-br/util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');

const criarOperacao = async (req, res) => {
    try {
        const tipo = req.headers.accept;
	    const operacaoFinanceira = req.body
        const result = await service.gerar({tipo, operacaoFinanceira});
        return Response.success(res, result);
    } catch (err) {
        return Response.error(res, err);
    }
}

/*
 * Returns all addresses in the wallet - /{blockchain}/addresses
 */
function listAddresses(req, res) {
    try {
        let objParams = paramUtil.getParams(req);
        service.listAddresses(objParams).then(
                function (result) {
                    responseUtil.makeResponseSuccess(res, result);
                }).catch(function (error) {
            responseUtil.makeResponseError(res, error);
        });
    } catch (err) {
        responseUtil.makeResponseError(res, err);
    }
}

/*
 * Returns a specific address - /{blockchain}/addresses/{address}
 */
function getAddress(req, res) {
    try {
        let objParams = paramUtil.getParams(req);
        service.getAddress(objParams).then(
                function (result) {
                    responseUtil.makeResponseSuccess(res, result);
                }).catch(function (error) {
            responseUtil.makeResponseError(res, error);
        });
    } catch (err) {
        responseUtil.makeResponseError(res, err);
    }
}

module.exports = {
    listAddresses: listAddresses,
    getAddress: getAddress,
    createNewAddress: createNewAddress,
    getBurnAddress: getBurnAddress
};
const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const { Operacao, Pagamento } = require('../database/db');
const { APPLICATION_IMAGE } = require('../util/http/content-type');
const { Err, Request, Response, Logger, ResponseError } = require('../util');
const { Instituicao } = require('../regras');
const path = ('path');
const fs = require('fs');

const MONGO = { ERROR_NAME: 'MongoError', DUPLICATE_KEY_CODE: 11000 }

const criarPagamento = async ({ uuidOperacao, pagamento }) => {
	try {
		const operacao = await Operacao.consultarOperacao(uuidOperacao);
		if (!operacao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 1, { uuidOperacao });
		}

		const instituicaoSolicitante = Instituicao.buscarPorChavePublica(pagamento.chavePublicaInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 2, { chavePublica: pagamento.chavePublicaInstituicao });
		}
		
		const resultado = await Pagamento.incluirPagamento(pagamento, operacao);
		return resultado;
	} catch(err) {
		Logger.warn(err);
		if(!(err instanceof ResponseError)) {
			if(err.name === MONGO.ERROR_NAME && err.code === MONGO.DUPLICATE_KEY_CODE) {
				if(err.keyPattern.uuid === 1){
					Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 2, pagamento);
				} else if(err.keyPattern.idRequisicao === 1){
					Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 3, pagamento);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 1000, 1, pagamento);
		}
		throw err;
	}
}

const consultarPagamentos = async ({ idRequisicao, cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	const options = {
		cnpjInstituicao,
		cpfCnpjBeneficiario,
		idRequisicao,
		paginaInicial,
		tamanhoPagina,
		periodoInicio,
		periodoFim
	}
	const resposta = await Pagamento.recuperarOperacoes(options);
	return resposta;
}

const consultarPagamento = async ({  uuid, cnpjInstituicao, originalUrl, userAgent, isWhatsApp }) => {

	const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
	if(!instituicaoSolicitante) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
	}

	let operacao = await Pagamento.consultarPagamento(uuid);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
	}
	if (isWhatsApp) {
		operacao = buildWhatsappContent({ operacao, originalUrl })
	}
	return operacao;
}

const autorizarPagamento = async ({ uuid, autorizacao }) => {
	const operacao = await Pagamento.consultarPagamento(uuid);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
	}
	const urlCallBack = operacao.callback;
	if (!urlCallBack) {
		autorizacao.dispositivoConfirmacao = {}
	} else {
		const dispositivoConfirmacao = await Request.post(urlCallBack, operacao);
		autorizacao.dispositivoConfirmacao = dispositivoConfirmacao;
	}
	await Pagamento.autorizarPagamento(uuid, autorizacao);
	let resposta = { sucessoPagamento: true, dataReferencia: new Date() }
	return resposta;
}

const confirmarPagamento = async ({ uuid, confirmacao }) => {
	const resposta = await Pagamento.confirmarPagamento(uuid, confirmacao);
	const result = { sucessoPagamento: true, dataReferencia: new Date() }
	return result;
}

module.exports = {
    criarPagamento,
    consultarPagamentos,
    consultarPagamento,
    confirmarPagamento
};
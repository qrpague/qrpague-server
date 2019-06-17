const uuidv4 = require('uuid/v4');
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

		pagamento.uuid = uuidv4();
		const resultado = await Pagamento.incluirPagamento(pagamento, operacao);
		return resultado;
	} catch(err) {
		Logger.warn(err);
		if(!(err instanceof ResponseError)) {
			if(err.name === MONGO.ERROR_NAME && err.code === MONGO.DUPLICATE_KEY_CODE) {
				if(err.keyPattern.uuid === 1){
					Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 3000, 4, pagamento);
				} else if(err.keyPattern.idRequisicao === 1){
					Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 3000, 5, pagamento);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 3, pagamento);
		}
		throw err;
	}
}

const consultarPagamentos = async ({ idRequisicao, cnpjInstituicao, cpfCnpjPagador, uuidOperacaoFinanceira, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
	if(!instituicaoSolicitante) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 2, { cnpj: cnpjInstituicao });
	}
	
	const options = {
		cnpjInstituicao,
		cpfCnpjPagador,
		uuidOperacaoFinanceira,
		idRequisicao,
		paginaInicial,
		tamanhoPagina,
		periodoInicio,
		periodoFim
	}
	const resposta = await Pagamento.recuperarOperacoes(options);
	return resposta;
}

const consultarPagamento = async ({  uuid, cnpjInstituicao }) => {

	const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
	if(!instituicaoSolicitante) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 2, { cnpj: cnpjInstituicao });
	}

	const pagamento = await Pagamento.consultarPagamento(uuid);
	if (!pagamento) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 1, { uuid });
	}
	return pagamento;
}

const confirmarPagamento = async ({ uuid, confirmacao }) => {
	let pagamento = await Pagamento.confirmarPagamento(uuid, confirmacao);
	if (!pagamento) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 5000, 1, { uuid });
	}
}

module.exports = {
    criarPagamento,
    consultarPagamentos,
    consultarPagamento,
    confirmarPagamento
};
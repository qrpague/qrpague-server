const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const jwt = require('../jwt');
const Crypto = require('../crypto');
const { Operacao, Pagamento } = require('../database/db');
const { APPLICATION_IMAGE } = require('../util/http/content-type');
const { Err, Request, Response, Logger, ResponseError } = require('../util');
const { Instituicao } = require('../regras');

const MY_PRIVATE_KEY = fs.readFileSync(process.env.MY_PRIVATE_KEY);
const MONGO = { ERROR_NAME: 'MongoError', DUPLICATE_KEY_CODE: 11000 }
const JWT = {
	ERROR_NAME: ['JsonWebTokenError', 'TokenExpiredError'],
	INVALID_SUBJECT: {
		ERROR_MESSAGE: 'jwt subject invalid'
	},
	INVALID_SIGNATURE: {
		ERROR_MESSAGE: 'invalid signature'
	},
	TOKEN_EXPIRED: {
		ERROR_MESSAGE: 'jwt expired'
	}
}

const criarPagamento = async ({ tokenInstituicao, uuidOperacao, pagamento }) => {

	try {

		pagamento.uuid = uuidv4();
		
		const cnpj = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpj) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 6);
		}
		pagamento.cnpjInstituicao = cnpj;

		const instituicaoSolicitante = Instituicao.buscar(pagamento.cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 3000, 2, { cnpj: pagamento.cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, pagamento.cnpjInstituicao);

		const operacao = await Operacao.consultarOperacao(uuidOperacao, Operacao.SITUACAO.EMITIDO);
		if (!operacao) {
			Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 3000, 1, { uuidOperacao });
		}
		if(!operacao.isValida()) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 7, { uuidOperacao });
		}
		
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

			} else if(isErroJWT(err)) {

				if(err.message.includes(JWT.INVALID_SUBJECT.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 3000, 2, { cnpj: pagamento.cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				} else if(err.message.includes(JWT.TOKEN_EXPIRED.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 4);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 3000, 3, pagamento);
		}
		throw err;
	}
}

const consultarPagamentos = async ({ idRequisicao, tokenInstituicao, cpfCnpjPagador, uuidOperacaoFinanceira, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	
	let cnpjInstituicao;

	try {

		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 3);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 4000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);
		
		
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
		const pagamentos = await Pagamento.recuperarOperacoes(options);
		const hashObj = Crypto.hash(JSON.stringify(pagamentos));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			quantidadeRegistros: pagamentos.length,
			paginaAtual: paginaInicial,
			tamanhoPagina: tamanhoPagina,
			resultados: pagamentos,
			hash: hashObj.hash,
			assinatura: signatureObj.signature,
			algoritmo: signatureObj.algorithm
		}
		return resultado;
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			if(isErroJWT(err)) {
				if(err.message.includes(JWT.INVALID_SUBJECT.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 4000, 2, { cnpj: cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				} else if(err.message.includes(JWT.TOKEN_EXPIRED.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 4);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000);
		}
		throw err;
	}
}

const consultarPagamento = async ({  uuid, tokenInstituicao }) => {
	
	let cnpjInstituicao;

	try {
		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 3);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 4000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);
	
		const pagamento = await Pagamento.consultarPagamento(uuid, cnpjInstituicao);
		if (!pagamento) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000, 1, { uuid, cnpj: cnpjInstituicao });
		}
	
		const hashObj = Crypto.hash(JSON.stringify(pagamento));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			resultado: pagamento,
			hash: hashObj.hash,
			assinatura: signatureObj.signature,
			algoritmo: signatureObj.algorithm
		}
		return resultado;
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			if(isErroJWT(err)) {
				if(err.message.includes(JWT.INVALID_SUBJECT.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.UNAUTHORIZED, 4000, 2, { cnpj: cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				} else if(err.message.includes(JWT.TOKEN_EXPIRED.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 4);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 4000);
		}
		throw err;
	}
}

const confirmarPagamento = async ({ uuid, confirmacaoPagamento }) => {

	try {
	
		let pagamento = await Pagamento.consultarPagamento(uuid);
		if (!pagamento) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 5000, 1, { uuid });
		}

		const uuidOperacao = pagamento.uuidOperacaoFinanceira;
		const operacao = await Operacao.consultarOperacao(uuidOperacao, Operacao.SITUACAO.EMITIDO);
		if (!operacao) {
			Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 5000, 5, { uuidOperacao });
		}
		if(!operacao.isValida()) {
			confirmacaoPagamento = { pagamentoConfirmado: false }
			await Pagamento.confirmarPagamento(uuid, confirmacaoPagamento);
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 5000, 6, { uuidOperacao });
		}
		
		const isTransferencia = (operacao.tipoOperacao === Operacao.TIPO_OPERACAO.TRANSFERENCIA);
		if(isTransferencia) {
			const efetivacaoOperacao = { operacaoEfetivada: true }
			let operacaoEfetivada = await Operacao.efetivarOperacao(uuidOperacao, efetivacaoOperacao, isTransferencia);
			if (!operacaoEfetivada) {
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 5000, 7, { uuidOperacao });
			}
		} else {
			pagamento = await Pagamento.confirmarPagamento(uuid, confirmacao);
			if (!pagamento) {
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 5000, 2, { uuid });
			}
		}
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 5000);
		}
		throw err;
	}
}

const extrairCNPJDoJWT = (token) => {
	if(!token) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 1);
	}
	const decodedJwt = jwt.decode(token);
	if(!decodedJwt){
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 3);
	}
	return decodedJwt.sub;	
}

const verificarTokenInstituicao = async (token, key, cnpj) => {
	const options = { subject: cnpj }
	await jwt.verify(token, key, options);
}

const isErroJWT = (err) => {
	return JWT.ERROR_NAME.includes(err.name);
}

module.exports = {
    criarPagamento,
    consultarPagamentos,
    consultarPagamento,
    confirmarPagamento
};
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const jwt = require('../jwt');
const { Operacao } = require('../database/db');
const { APPLICATION_IMAGE } = require('../util/http/content-type');
const { ResponseError, Err, Request, Response, Logger, YAMLReader } = require('../util');
const { Instituicao } = require('../regras');
const Crypto = require('../crypto');

const MY_PRIVATE_KEY = fs.readFileSync(process.env.MY_PRIVATE_KEY);
const SERVER_URL = process.env.SERVER_URL;
const QRPAGUE_IMAGE_URL = process.env.QRPAGUE_IMAGE_URL || 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4';
const WHATSAPP_TEMPLATE_FILE = path.join(__dirname, '../templates/whatsapp/shareLink.html');

const MONGO = { ERROR_NAME: 'MongoError', DUPLICATE_KEY_CODE: 11000 }

const criarOperacao = async ({ contentType, operacaoFinanceira }) => {
	try {
		operacaoFinanceira.uuid = uuidv4();
		const resultado = await Operacao.incluirOperacao(operacaoFinanceira);
		let resposta;
		if (contentType === APPLICATION_IMAGE) {
			resposta = await QRCode.toDataURL(JSON.stringify(operacaoFinanceira));
		} else {
			resposta = SERVER_URL + '/operacoes/' + resultado.uuid
		}
		return resposta;
	} catch(err) {
		Logger.warn(err);
		if(err.name === MONGO.ERROR_NAME && err.code === MONGO.DUPLICATE_KEY_CODE) {
			if(err.keyPattern.uuid === 1){
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 2, operacaoFinanceira);
			} else if(err.keyPattern.idRequisicao === 1){
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 3, operacaoFinanceira);
			}
		}
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 1000, 1, operacaoFinanceira);
	}
}

const consultarOperacoes = async ({ idRequisicao, tokenInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {

	let cnpjInstituicao;

	try {

		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 3);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);

		const options = {
			cnpjInstituicao,
			cpfCnpjBeneficiario,
			idRequisicao,
			paginaInicial,
			tamanhoPagina,
			periodoInicio,
			periodoFim
		}
		const operacoes = await Operacao.recuperarOperacoes(options);
		const hashObj = Crypto.hash(JSON.stringify(operacoes));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			quantidadeRegistros: operacoes.length,
			paginaAtual: paginaInicial,
			tamanhoPagina: tamanhoPagina,
			resultados: operacoes,
			hash: hashObj.hash,
			assinatura: signatureObj.signature,
			algoritmo: signatureObj.algorithm
		}
		return resultado;
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			if(err.name === JWT.ERROR_NAME) {
				if(err.message.includes(JWT.INVALID_SUBJECT.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000);
		}
		throw err;
	}
}

const consultarOperacao = async ({  uuid, tokenInstituicao }) => {

	let cnpjInstituicao;

	try {

		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 3);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);
	
		let operacao = await Operacao.consultarOperacao(uuid);
		if (!operacao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
		}
	
		const hashObj = Crypto.hash(JSON.stringify(operacao));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			resultado: operacao,
			hash: hashObj.hash,
			assinatura: signatureObj.signature,
			algoritmo: signatureObj.algorithm
		}
		return resultado;
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			if(err.name === JWT.ERROR_NAME) {
				if(err.message.includes(JWT.INVALID_SUBJECT.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000);
		}
		throw err;
	}
}

const autorizarOperacao = async ({ uuid, autorizacao }) => {
	const operacao = await Operacao.consultarOperacao(uuid);
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
	await Operacao.autorizarOperacao(uuid, autorizacao);
	let resposta = { sucessoOperacao: true, dataReferencia: new Date() }
	return resposta;
}

const confirmarOperacao = async ({ uuid, confirmacao }) => {
	let operacao = await Operacao.consultarOperacao(uuid);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 6000, 1, { uuid });
	}

	operacao = await Operacao.confirmarOperacao(uuid, confirmacao);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 6000, 2, { uuid });
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

module.exports = {
	criarOperacao,
	consultarOperacoes,
	consultarOperacao,
	autorizarOperacao,
	confirmarOperacao
}
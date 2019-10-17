const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
const jwt = require('../jwt');
const { Operacao } = require('../database/db');
const { ResponseError, Err, Request, Response, Logger, YAMLReader } = require('../util');
const { Instituicao } = require('../regras');
const Crypto = require('../crypto');

const MY_PRIVATE_KEY = fs.readFileSync(process.env.MY_PRIVATE_KEY);

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

const consultarBeneficiarios = async ({ cpfCnpj, tokenInstituicao, paginaInicial, tamanhoPagina }) => {

	let cnpjInstituicao;

	try {

		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 1);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);

		cpfCnpj = !cpfCnpj ? [] : cpfCnpj.split(',');

		const options = {
			cpfCnpj,
			paginaInicial,
			tamanhoPagina
		}
		const beneficiarios = await Operacao.consultarBeneficiarios(options);
		const hashObj = Crypto.hash(JSON.stringify(beneficiarios));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			quantidadeRegistros: beneficiarios.length,
			paginaAtual: paginaInicial,
			tamanhoPagina: tamanhoPagina,
			resultados: beneficiarios,
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
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 2, { cnpj: cnpjInstituicao });
				} else if(err.message.includes(JWT.INVALID_SIGNATURE.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 2);
				} else if(err.message.includes(JWT.TOKEN_EXPIRED.ERROR_MESSAGE)) {
					Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 999000, 4);
				}
			}
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000);
		}
		throw err;
	}
}

const consultarBeneficiario = async ({ cpfCnpj, tokenInstituicao }) => {

	let cnpjInstituicao;

	try {

		cnpjInstituicao = extrairCNPJDoJWT(tokenInstituicao);
		if(!cnpjInstituicao) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 1);
		}
	
		const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
		if(!instituicaoSolicitante) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 2, { cnpj: cnpjInstituicao });
		}
		
		await verificarTokenInstituicao(tokenInstituicao, instituicaoSolicitante.chavePublica, cnpjInstituicao);
	
		const beneficiarios = await Operacao.consultarBeneficiarios({cpfCnpj: [cpfCnpj]});
		const beneficiario = beneficiarios[0];
		if (!beneficiario) {
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000, 3, { cpfCnpj });
		}
	
		const hashObj = Crypto.hash(JSON.stringify(beneficiario));
		const signatureObj = Crypto.sign(hashObj.hash, MY_PRIVATE_KEY);
		const resultado = {
			resultado: beneficiario,
			hash: hashObj.hash,
			assinatura: signatureObj.signature,
			algoritmo: signatureObj.algorithm
		}
		return resultado;
	} catch(err) {

		Logger.warn(err);

		if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 9000);
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
	consultarBeneficiarios,
	consultarBeneficiario
}
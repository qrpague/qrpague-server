const { CONSTANTS } = require('../jwt');
const { ResponseError, Err, Logger } = require('../util');
const { campoObrigatorio } = require('./commum');

const requisicaoCriarOperacao = (params, body) => {
    
    try {

        campoObrigatorio('callbackURI', body.callbackURI);
        campoObrigatorio('versao', body.versao);
        campoObrigatorio('valor', body.valor);
        campoObrigatorio('cnpjInstituicao', body.cnpjInstituicao);
        campoObrigatorio('dataHoraVencimento', body.dataHoraVencimento);
        campoObrigatorio('tipoOperacao', body.tipoOperacao);
        campoObrigatorio('beneficiario', body.beneficiario);
        campoObrigatorio('nome', body.beneficiario.nome);
        campoObrigatorio('cpfCnpj', body.beneficiario.cpfCnpj);
        campoObrigatorio('instituicao', body.beneficiario.instituicao);

        let requisicao = {
            callbackURI: body.callbackURI,
            versao: body.versao,
            valor: body.valor,
            cnpjInstituicao: body.cnpjInstituicao,
            dataHoraVencimento: body.dataHoraVencimento,
            tipoOperacao: body.tipoOperacao,
            beneficiario: {
                nome: body.beneficiario.nome,
                cpfCnpj: body.beneficiario.cpfCnpj,
                instituicao: body.beneficiario.instituicao,
            }
        }

        if(body.idRequisicao) {
            requisicao = { ...requisicao, idRequisicao: body.idRequisicao }
        }

        if(body.descricao) {
            requisicao = { ...requisicao, descricao: body.descricao }
        }

        if(body.exigeEndereco || typeof body.exigeEndereco === 'boolean') {
            requisicao = { ...requisicao, exigeEndereco: body.exigeEndereco }
        }

        if(body.pagamentoParcial || typeof body.pagamentoParcial === 'boolean') {
            requisicao = { ...requisicao, pagamentoParcial: body.pagamentoParcial }
        }

        if(body.exigeEmail || typeof body.exigeEmail === 'boolean') {
            requisicao = { ...requisicao, exigeEmail: body.exigeEmail }
        }

        if(body.beneficiario.endereco) {
            if(body.beneficiario.endereco.logradouro) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            logradouro: body.beneficiario.endereco.logradouro
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.complemento) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            complemento: body.beneficiario.endereco.complemento
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.bairro) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            bairro: body.beneficiario.endereco.bairro
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.valorUnitario) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            valorUnitario: body.beneficiario.endereco.valorUnitario
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.localidade) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            localidade: body.beneficiario.endereco.localidade
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.uf) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            uf: body.beneficiario.endereco.uf
                        }
                    }
                }
            }

            if(body.beneficiario.endereco.cep) {
                requisicao = { 
                    ...requisicao, 
                    beneficiario: { 
                        ...requisicao.beneficiario,
                        endereco: {
                            ...requisicao.beneficiario.endereco,
                            cep: body.beneficiario.endereco.cep
                        }
                    }
                }
            }
        }

        if(body.beneficiario.agencia) {
            requisicao = { 
                ...requisicao, 
                beneficiario: { 
                    ...requisicao.beneficiario,
                    agencia: body.beneficiario.agencia
                }
            }
        }

        if(body.beneficiario.conta) {
            requisicao = { 
                ...requisicao, 
                beneficiario: { 
                    ...requisicao.beneficiario,
                    conta: body.beneficiario.conta
                }
            }
        }

        if(body.beneficiario.operacao) {
            requisicao = { 
                ...requisicao, 
                beneficiario: { 
                    ...requisicao.beneficiario,
                    operacao: body.beneficiario.operacao
                }
            }
        }

        if(body.beneficiario.tipoConta) {
            requisicao = { 
                ...requisicao, 
                beneficiario: { 
                    ...requisicao.beneficiario,
                    tipoConta: body.beneficiario.tipoConta
                }
            }
        }

        if(body.itens) {
            if(Array.isArray(body.itens) && body.itens.length > 0) {
                requisicao = { 
                    ...requisicao, 
                    itens: []
                }

                for(let i =0; i<body.itens.length; i++) {
                    const item = body.itens[i];
                    
                    campoObrigatorio('descricaoCompleta', item.descricaoCompleta);
                    campoObrigatorio('quantidade', item.quantidade);
                    campoObrigatorio('valorUnitario', item.valorUnitario);
                    campoObrigatorio('total', item.total);

                    let result = {
                        descricaoCompleta: item.descricaoCompleta,
                        quantidade: item.quantidade,
                        valorUnitario: item.valorUnitario,
                        total: item.total
                    }

                    if(item.descricao48) {
                        requisicao = { ...result, descricao48: item.descricao48 }
                    }

                    if(item.codigo) {
                        requisicao = { ...result, codigo: item.codigo }
                    }

                    if(item.desconto) {
                        requisicao = { ...result, desconto: item.desconto }
                    }

                    if(item.urlThumbImg) {
                        requisicao = { ...result, urlThumbImg: item.urlThumbImg }
                    }

                    requisicao.itens.push(result);
                }
            }
        }

        return requisicao;
    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

const requisicaoConsultarOperacoes = (params, body) => {

    try {
        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);
        campoObrigatorio('cpfCnpjBeneficiario', params.cpfCnpjBeneficiario);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
            cpfCnpjBeneficiario: params.cpfCnpjBeneficiario
        }

        if(params.idRequisicao) {
            requisicao = { ...requisicao, idRequisicao: params.idRequisicao }
        }

        if(params.paginaInicial) {
            requisicao = { ...requisicao, paginaInicial: params.paginaInicial }
        }

        if(params.tamanhoPagina) {
            requisicao = { ...requisicao, tamanhoPagina: params.tamanhoPagina }
        }

        if(params.periodoInicio) {
            requisicao = { ...requisicao, periodoInicio: params.periodoInicio }
        }

        if(params.periodoFim) {
            requisicao = { ...requisicao, periodoFim: params.periodoFim }
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

const requisicaoConsultarOperacao = (params, body) => {

    try {

        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);
        campoObrigatorio('uuid', params.uuid);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
            uuid: params.uuid
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

const requisicaoEfetivarOperacao = (params, body) => {
    try {

        campoObrigatorio('uuid', params.uuid);
        campoObrigatorio('operacaoEfetivada', body.operacaoEfetivada);

        
        let requisicao = {
            uuid: params.uuid,
            efetivacaoOperacao: {
                operacaoEfetivada: body.operacaoEfetivada
            }
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

const requisicaoConfirmarOperacao = (params, body) => {
    try {

        campoObrigatorio('uuid', params.uuid);
        campoObrigatorio('operacaoConfirmada', body.operacaoConfirmada);

        
        let requisicao = {
            uuid: params.uuid,
            confirmacaoOperacao: {
                operacaoConfirmada: body.operacaoConfirmada
            }
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

module.exports = {
    requisicaoCriarOperacao,
    requisicaoConsultarOperacoes,
    requisicaoConsultarOperacao,
    requisicaoEfetivarOperacao,
    requisicaoConfirmarOperacao
}
const { CONSTANTS } = require('../jwt');
const { ResponseError, Err, Logger } = require('../util');
const { campoObrigatorio } = require('./commum');

const requisicaoCriarPagamento = (params, body) => {
    
    try {

        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);
        campoObrigatorio('uuid', params.uuid);
        campoObrigatorio('valor', body.valor);
        campoObrigatorio('pagador', body.pagador);
        campoObrigatorio('nome', body.pagador.nome);
        campoObrigatorio('cpfCnpj', body.pagador.cpfCnpj);
        campoObrigatorio('instituicao', body.pagador.instituicao);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
            uuidOperacao: params.uuid,
            pagamento: {
                valor: body.valor,
                pagador: {
                    nome: body.pagador.nome,
                    cpfCnpj: body.pagador.cpfCnpj,
                    instituicao: body.pagador.instituicao,
                }
            }
        }

        if(body.idRequisicao) {
            requisicao = { ...requisicao,
                pagamento: {
                    ...requisicao.pagamento,
                    idRequisicao: body.idRequisicao
                }
            }
        }

        if(body.pagador.endereco) {
            if(body.pagador.endereco.logradouro) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            logradouro: body.pagador.endereco.logradouro
                        }
                    }
                }
            }

            if(body.pagador.endereco.complemento) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            complemento: body.pagador.endereco.complemento
                        }
                    }
                }
            }

            if(body.pagador.endereco.bairro) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            bairro: body.pagador.endereco.bairro
                        }
                    }
                }
            }

            if(body.pagador.endereco.valorUnitario) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            valorUnitario: body.pagador.endereco.valorUnitario
                        }
                    }
                }
            }

            if(body.pagador.endereco.localidade) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            localidade: body.pagador.endereco.localidade
                        }
                    }
                }
            }

            if(body.pagador.endereco.uf) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            uf: body.pagador.endereco.uf
                        }
                    }
                }
            }

            if(body.pagador.endereco.cep) {
                requisicao = { 
                    ...requisicao, 
                    pagador: { 
                        ...requisicao.pagador,
                        endereco: {
                            ...requisicao.pagador.endereco,
                            cep: body.pagador.endereco.cep
                        }
                    }
                }
            }
        }

        if(body.pagador.agencia) {
            requisicao = { 
                ...requisicao, 
                pagador: { 
                    ...requisicao.pagador,
                    agencia: body.pagador.agencia
                }
            }
        }

        if(body.pagador.conta) {
            requisicao = { 
                ...requisicao, 
                pagador: { 
                    ...requisicao.pagador,
                    conta: body.pagador.conta
                }
            }
        }

        if(body.pagador.operacao) {
            requisicao = { 
                ...requisicao, 
                pagador: { 
                    ...requisicao.pagador,
                    operacao: body.pagador.operacao
                }
            }
        }

        if(body.pagador.tipoConta) {
            requisicao = { 
                ...requisicao, 
                pagador: { 
                    ...requisicao.pagador,
                    tipoConta: body.pagador.tipoConta
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

const requisicaoConsultarPagamentos = (params, body) => {

    try {
        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME]
        }

        if(params.idRequisicao) {
            requisicao = { ...requisicao, idRequisicao: params.idRequisicao }
        }

        if(params.cpfCnpjPagador) {
            requisicao = { ...requisicao, cpfCnpjPagador: params.cpfCnpjPagador }
        }

        if(params.uuidOperacaoFinanceira) {
            requisicao = { ...requisicao, uuidOperacaoFinanceira: params.uuidOperacaoFinanceira }
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

const requisicaoConsultarPagamento = (params, body) => {

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

const requisicaoConfirmarPagamento = (params, body) => {
    try {

        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);
        campoObrigatorio('uuid', params.uuid);
        campoObrigatorio('pagamentoConfirmado', body.pagamentoConfirmado);

        let requisicao = {
            uuid: params.uuid,
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
            confirmacao: {
                pagamentoConfirmado: body.pagamentoConfirmado
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
    requisicaoCriarPagamento,
    requisicaoConsultarPagamentos,
    requisicaoConsultarPagamento,
    requisicaoConfirmarPagamento,
}
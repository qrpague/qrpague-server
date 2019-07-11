const { Err, Logger, Request } = require('../../util');
const { Operacao, SITUACAO, TIPO_OPERACAO } = require('../schema/operacao-financeira');
const DateUtil = require('../../helper/date-util');

const DEFAULT_MONGOOSE_LIMIT = 30;
const DEFAULT_MONGOOSE_SKIP = 0;

const validarDatas = ({ dataHoraSolicitacao, dataHoraVencimento }) => {
    if(dataHoraVencimento.getTime() <= dataHoraSolicitacao.getTime()){
        throw new Error(
            `A dataHoraVencimento - ${dataHoraVencimento} deve ser maior que
             a dataHoraSolicitacao - ${dataHoraSolicitacao}`
        );
    }
}

module.exports = (db, mongoose, promise) => {
    
    let Schema = mongoose.Schema;
    let operacaoSchema = new Schema(Operacao, { 
        collection: 'Operacao',
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
            }
        }
    });

    operacaoSchema.pre('save', function (next) {
        try {
            validarDatas(this);
            next();
        } catch(err) {
            next(err);
        }
    })

    operacaoSchema.methods.isValida = function() {
        const now = new Date();
        const dataHoraVencimento = this.dataHoraVencimento;
        const result = DateUtil.compare(now, dataHoraVencimento);
        const isValida = (result < 0);
        return isValida;
    }

    operacaoSchema.methods.chamarCallbackURI = function() {

        const uuidOperacao = this.uuid;
        const pagamentos = this.pagamentos;
        
        const operacaoCallbackURI = this.callbackURI + 
                '?tipo=operacao' +
                '&uuidOperacao=' + 
                uuidOperacao +
                '&situacao=' + 
                this.situacao;
    
        Request.get(operacaoCallbackURI);
    
        if(pagamentos && Array.isArray(pagamentos) && pagamentos.length > 0) {
            for(let i=0; i< pagamentos.length; i++) {
                const pagamento = pagamentos[i];
                const pagamentoCallbackURI = this.callbackURI +
                    '?tipo=pagamento' + 
                    '&uuidOperacao=' +
                    uuidOperacao +
                    '&uuidPagamento=' +
                    pagamento.uuid +
                    '&situacao=' + 
                    pagamento.situacao;
    
                Request.get(pagamentoCallbackURI);				
            }
        }
    }

    let OperacaoModel = db.model('Operacao', operacaoSchema);

    OperacaoModel.TIPO_OPERACAO = TIPO_OPERACAO;
    OperacaoModel.SITUACAO = SITUACAO;

    OperacaoModel.incluirOperacao = async (op) => {
        Logger.debug('Inclusão de Operação Financeira');

        op.dataHoraSolicitacao = Date.now();
        op.dataHoraVencimento = new Date(op.dataHoraVencimento).getTime();
        let operacao = new OperacaoModel(op);
		return await operacao.save();
    },

	OperacaoModel.recuperarOperacoes = async ({ idRequisicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
        Logger.debug('Consulta de Operações Financeiras');

        let query = {}
        if(idRequisicao){
            query = { ...query, idRequisicao: idRequisicao }
        }
        if(cpfCnpjBeneficiario){
            query = { ...query, "beneficiario.cpfCnpj": cpfCnpjBeneficiario }
        }
        if(periodoInicio){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $gte: periodoInicio } }
        }
        if(periodoFim){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $lte: periodoFim } }
        }

        const limit = tamanhoPagina ? parseInt(tamanhoPagina) : DEFAULT_MONGOOSE_LIMIT;
        const skip = paginaInicial ? parseInt(paginaInicial) * limit : DEFAULT_MONGOOSE_SKIP;
        const opt = { skip, limit }
        return await OperacaoModel.find(query, null, opt).populate('pagamentos');
	},

	OperacaoModel.consultarOperacao = async ( uuid, situacao ) => {
        Logger.debug('Consulta de Operação Financeira');

        let query = { uuid }
        if(situacao) {
            query.situacao = situacao;
        }

        return await OperacaoModel.findOne(query).populate('pagamentos');
	},

	OperacaoModel.efetivarOperacao = async (uuid, efetivacaoOperacao, isTransferencia = false) => {

        Logger.debug('Efetivação da Operação');

        efetivacaoOperacao.dataHoraEfetivacao = Date.now();

        let session;
        try {
            session = await db.startSession();
            session.startTransaction();
            const situacao = (efetivacaoOperacao.operacaoEfetivada) ? SITUACAO.EFETIVADO : SITUACAO.REJEITADO;
            let query = { uuid, situacao: SITUACAO.EMITIDO }

            if(isTransferencia){
                query = {
                    ...query,
                    "$and": [
                        {"pagamentos": {"$exists": true}},
                        {"pagamentos": {"$size": 1}}
                    ]
                }
            }

            let operacao = await OperacaoModel.findOne(query).populate('pagamentos');
            
            if(!operacao){
                return null
            }

            const pagamentos = operacao.pagamentos;

            for(let i=0; i < pagamentos.length; i++){
                let idPagamento = pagamentos[i]._id;
                let pagamento = await db.model('Pagamento').findOne({ _id: idPagamento });
                if(isTransferencia === true) {
                    pagamento.situacao = SITUACAO.CONFIRMADO;
                    pagamento.confirmacaoPagamento = { 
                        pagamentoConfirmado: true,
                        dataHoraConfirmacao: Date.now()
                    }
                    await pagamento.save();
                } else if(situacao === SITUACAO.REJEITADO || !pagamento.confirmacaoPagamento) {
                    pagamento.situacao = SITUACAO.CANCELADO;
                    pagamento.confirmacaoPagamento = { 
                        pagamentoConfirmado: false,
                        dataHoraConfirmacao: Date.now()
                    }
                    await pagamento.save();
                }
            }
            operacao.situacao = situacao;
            operacao.efetivacaoOperacao = efetivacaoOperacao;
            await operacao.save();
            await session.commitTransaction();
            return OperacaoModel.findOne({ uuid }).populate('pagamentos');
        } catch(err) {
            Logger.warn(err);
            session.abortTransaction();
            throw err;
        }
    }

    OperacaoModel.confirmarOperacao = async (uuid, confirmacaoOperacao) => {

        Logger.debug('Confirmação da Operação');

        confirmacaoOperacao.dataHoraConfirmacao = Date.now();

        let session;
        try {
            session = await db.startSession();
            session.startTransaction();
            const situacao = (confirmacaoOperacao.operacaoConfirmada) ? SITUACAO.CONFIRMADO : SITUACAO.CANCELADO;
            let query = { uuid, situacao: SITUACAO.EFETIVADO }

            let operacao = await OperacaoModel.findOne(query).populate('pagamentos');
            
            if(!operacao){
                return null;
            }
            
            if(situacao === SITUACAO.CANCELADO){
                const pagamentos = operacao.pagamentos;
                for(let i=0; i < pagamentos.length; i++){
                    let idPagamento = pagamentos[i]._id;
                    let pagamento = await db.model('Pagamento').findOne({ _id: idPagamento });
                    pagamento.situacao = SITUACAO.CANCELADO;
                    pagamento.confirmacaoPagamento = { 
                        pagamentoConfirmado: false,
                        dataHoraConfirmacao: Date.now()
                    }
                    await pagamento.save();
                }
            }
            operacao.situacao = situacao;
            operacao.confirmacaoOperacao = confirmacaoOperacao;
            await operacao.save();
            await session.commitTransaction();
            return OperacaoModel.findOne({ uuid }).populate('pagamentos');
        } catch(err) {
            Logger.warn(err);
            session.abortTransaction();
            throw err;
        }
    }

    return OperacaoModel;
}
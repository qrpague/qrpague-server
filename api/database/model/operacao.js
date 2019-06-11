const uuidv4 = require('uuid/v4');
const { Err, Logger } = require('../../util');
const { OperacaoSchema, SITUACAO, TIPO_OPERACAO } = require('../schema/operacao-financeira');

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
    let operacaoSchema = new Schema(OperacaoSchema, { collection: 'Operacao' });

    operacaoSchema.pre('save', function (next) {
        try {
            validarDatas(this);
            next();
        } catch(err) {
            next(err);
        }
    })

    let OperacaoModel = db.model('Operacao', operacaoSchema);

    OperacaoModel.TIPO_OPERACAO = TIPO_OPERACAO;
    OperacaoModel.SITUACAO = SITUACAO;

    OperacaoModel.incluirOperacao = async (obj) => {
        obj.uuid = uuidv4()
        obj.dataHoraVencimento = new Date(obj.dataHoraVencimento);
        
        Logger.debug('Inclusão de Operação Financeira', '=>', JSON.stringify(obj));
        let operacao = new OperacaoModel(obj);
		return await operacao.save();
    },

	OperacaoModel.recuperarOperacoes = async (options) => {
        Logger.debug('Consulta de Operações Financeiras', '=>', JSON.stringify(options));
        return await OperacaoModel.find({ limit : 20, sort : { dataHoraEfetivacao : -1 }});
	},

	OperacaoModel.consultarOperacao = async ( uuid ) => {
        Logger.debug('Consulta da Operação de uuid', '=>', uuid);
        return await OperacaoModel.findOne({ uuid });
	},

	OperacaoModel.autorizarOperacao = async (uuid, autorizacaoOperacao) => {
        Logger.debug('Autorização da Operação de uuid', '=>', uuid, ' - Dados da autorização =>', autorizacaoOperacao);
		var situacao = (dados.operacaoAutorizada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, autorizacaoOperacao });
	},

	OperacaoModel.confirmarOperacao = async (uuid, confirmacaoOperacao) => {
        Logger.debug('Confirmação da Operação de uuid', '=>', uuid, ' - Dados da confirmação =>', confirmacaoOperacao);
        var situacao = (dados.operacaoConfirmada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, confirmacaoOperacao });
	}

    return OperacaoModel;
}
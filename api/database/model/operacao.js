const { Err } = require('@sfd-br/util');
const { OperacaoSchema, SITUACAO, TIPO_OPERACAO } = require('../schema/operacao-financeira');

module.exports = (db, mongoose, promise) => {
    
    let Schema = mongoose.Schema;
    let operacaoSchema = new Schema(OperacaoSchema, { collection: 'Operacao' });
    let OperacaoModel = db.model('Operacao', operacaoSchema);

    OperacaoModel.TIPO_OPERACAO = TIPO_OPERACAO;
    OperacaoModel.SITUACAO = SITUACAO;

    OperacaoModel.incluirOperacao = async (obj) => {
        let operacao = new OperacaoModel(obj);
		return await operacao.save();
    },

	OperacaoModel.recuperarOperacoes = async (options) => {
        return await OperacaoModel.find({ limit : 20, sort : { dataHoraEfetivacao : -1 }});
	},

	OperacaoModel.consultarOperacao = async ( uuid ) => {
        return await OperacaoModel.findOne({ uuid });
	},

	OperacaoModel.autorizarOperacao = async (uuid, autorizacaoOperacao) => {
		var situacao = (dados.operacaoAutorizada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, autorizacaoOperacao });
	},

	OperacaoModel.confirmarOperacao = async (uuid, confirmacaoOperacao) => {
        var situacao = (dados.operacaoConfirmada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, confirmacaoOperacao });
	}

    return OperacaoModel;
}
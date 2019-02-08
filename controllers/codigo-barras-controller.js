'use strict';

let Error = require( global.pathRootApp + '/error')
let Validador = require('boleto-brasileiro-validator')


module.exports = {


	detail: async function (req, res, next) {
		var codigoBarras = req.params.codigoBarras;
		let tipoBoleto = null
		if (codigoBarras == "") {
			return next(Error("Código de barras não informado"));

		}
		try {
			if (Validador.boletoBancario(codigoBarras)) {
				tipoBoleto = "BOLETO-BANCARIO"
			} else if (Validador.boletoArrecadacao(codigoBarras)) {
				tipoBoleto = "CONVENIO"
			} else if (Validador.boletoBancarioLinhaDigitavel(codigoBarras)) {
				tipoBoleto = "BOLETO-BANCARIO"
			} else if (Validador.boletoArrecadacaoLinhaDigitavel(codigoBarras)) {
				tipoBoleto = "CONVENIO"
			}
		} catch (erro) {
			console.log(erro)
		}


		res.setHeader('Content-Type', 'application/qrpague');
		res.status(200).send({ "codigoBarras": codigoBarras, lenght: codigoBarras.length, tipoOperacao: tipoBoleto });
	}

}


module.exports = function(app) {
	var qrPag = app.controllers.qrPagController;
	
	app.post('/operacao', qrPag.gerar);
	app.get('/operacoes', qrPag.recuperarOperacoes);
	app.get('/operacoes/:uuid', qrPag.consultarOperacao);
	app.post('/operacoes/:uuid/autorizacao', qrPag.autorizarOperacao);
	app.post('/operacoes/:uuid/confirmacao', qrPag.receberConfirmacao);
	app.get('/codigo-barras/:codigoBarras', qrPag.retornaCodigoBarra);
};

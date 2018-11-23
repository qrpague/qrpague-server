var path = require('path');
global.pathRootApp = path.resolve(__dirname);

var configuracoes = {
	httpPort : 9092,
	httpHost : '0.0.0.0',
	portWebsocket : 4000,
	urlDataBase : 'localhost:10001'
};

exports.Config = configuracoes;

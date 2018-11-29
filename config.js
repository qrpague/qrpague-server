
var Config = {

	PROTOCOL: 'http',
	HTTP_PORT : 9092,
	HTTP_HOST : '0.0.0.0',
	WEBSOCKET_PORT : 4000,
	URL_DATABASE : '127.0.0.1:10001/QRPAGUE',
	QRPAGUE_URL_QRCODE_CREATE: '0.0.0.0:9092/operacoes/',

 
};

module.exports = Config;




String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
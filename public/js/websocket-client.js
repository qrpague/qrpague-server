function conectarSocket(  callback  ) {

    var params = new URLSearchParams()
    params.append('idTerminal', connectApp.idTerminal)

    let path = '?' + params.toString()
    let urlPath = connectApp.websocket_url + path

    let connection = new WebSocket(urlPath);

    connection.onopen = function (event) {
        console.log("Websocket opened")
    }
    connection.onclose = function (event) {
        console.log("Websocket closed")

        setTimeout(function () { conectarSocket() }, 1500);
        Msg( "WEBSOCKET is not open " , 'top-center')
  
    }
    connection.onerror = function (event) {
        console.error("Websocket connection error ")
    }
    connection.onmessage = function (event) {
        callback( event )
    }


    return connection
};

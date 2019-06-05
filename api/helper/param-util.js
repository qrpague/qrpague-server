const getParams = (req) => {
    return Object.entries(req.swagger.params).reduce((params, [ key, value ]) => { 
        params[key] = value.value
        return params;
    }, {});
}

module.exports = {
    getParams
}
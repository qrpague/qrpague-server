let rp = require('request-promise');


module.exports = {
    request: function (options) {
        return rp(options);

    },
    get: function (options) {

        return rp.get(options);
    },

    post: function (options) {

        return rp.post(options);
    },

    put: function (options) {

        return rp.put(options);
    }
}

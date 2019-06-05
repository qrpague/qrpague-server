const parseJson = (data) => {
    var parsed;

    try {
        parsed = JSON.parse(data);
    } catch (e) {
        parsed = JSON.parse(JSON.stringify(data));
    }
    return parsed;
}

module.exports ={
    parseJson
}
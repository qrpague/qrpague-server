const YAMLReader = require('../yaml/yaml-reader');
const path = require('path');

const TYPE_CONST = 'T_',
      INSTANCE_CONST = 'C_';

const MessageInfo = class MessageInfo {

    constructor(yamlFilePath) {
        const schemaValidatorFilePath = path.join(__dirname, 'message-schema.json');
        this.doc = formatDoc(YAMLReader.readYAML(yamlFilePath, schemaValidatorFilePath));
    }

    find(codigoErro, codigoDetalheErro, parametros) {
        return retrieve({
            doc: this.doc,
            codigoErro,
            codigoDetalheErro,
            parametros
        });
    }
}

const retrieve = ({ doc, codigoErro, codigoDetalheErro, parametros }) => {

    let type = doc[TYPE_CONST + codigoErro];
    let instance;

    if(!type) {
        return undefined;
    }
    
    let result = {
        codigoErro: type.codigoErro,
        mensagemErro: type.mensagemErro
    }

    if(codigoDetalheErro) {
        instance = type[INSTANCE_CONST + codigoDetalheErro];
        if(instance){
            const response = buildDetail(instance.detalheErro, parametros);
            result = {
                ...result,
                codigoDetalheErro: instance.codigoDetalheErro,
                detalheErro: response.detalheErro,
                parametros: response.parametros
            }
        }

    }

    return result;
}

const buildDetail = (detalheErro, parametros) => {
    let resultParams = {}
    let novoDetalheErro = detalheErro;
    if(parametros) {
        Object.entries(parametros).forEach(([key, value]) => {
            if(detalheErro.includes(key)){
                const replaceStr = '${' + key + '}'
                novoDetalheErro = novoDetalheErro.replace(replaceStr, value);
                resultParams[key] = value;
            }
        });
    }
    return { detalheErro: novoDetalheErro, parametros: resultParams };
}

const formatDoc = (doc) => {
    let newDoc = {};
    for (let i=0; i<doc.erros.length; i++) {
        let typeObject = doc.erros[i];
        let typeValue = Object.values(typeObject)[0];
        newDoc[TYPE_CONST + typeValue.codigoErro] = {
            codigoErro: typeValue.codigoErro,
            mensagemErro: typeValue.mensagemErro
        }
        for(let j=0; j<typeValue.detalhes.length; j++) {
            let instanceObject = typeValue.detalhes[j];
            let instanceValue = Object.values(instanceObject)[0];
            newDoc[TYPE_CONST + typeValue.codigoErro][INSTANCE_CONST + instanceValue.codigoDetalheErro] = {
                codigoDetalheErro: instanceValue.codigoDetalheErro,
                detalheErro: instanceValue.detalheErro
            }
        }
    }
    return newDoc;
}

module.exports = MessageInfo;
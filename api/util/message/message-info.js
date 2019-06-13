const YAMLReader = require('../yaml/yaml-reader');
const path = require('path');

const TYPE_CONST = 'T_',
      INSTANCE_CONST = 'C_';

const MessageInfo = class MessageInfo {

    constructor(yamlFilePath) {
        const schemaValidatorFilePath = path.join(__dirname, 'message-schema.json');
        this.doc = formatDoc(YAMLReader.readYAML(yamlFilePath, schemaValidatorFilePath));
    }

    find(typeCode, instanceCode, params) {
        return retrieve({
            doc: this.doc,
            typeCode,
            instanceCode,
            params
        });
    }
}

const retrieve = ({ doc, typeCode, instanceCode, params }) => {

    let type = doc[TYPE_CONST + typeCode];
    let instance;

    if(!type) {
        return undefined;
    }
    
    let result = {
        typeCode: type.type_code,
        type: type.type,
        title: type.title
    }

    if(instanceCode) {
        instance = type[INSTANCE_CONST + instanceCode];
        if(instance){
            const response = buildDetail(instance.detail, params);
            result = {
                ...result,
                instanceCode: instance.instance_code,
                instance: instance.instance,
                detail: response.detail,
                params: response.params
            }
        }

    }

    return result;
}

const buildDetail = (detail, params) => {
    let resultParams = {}
    let newDetail = detail;
    if(params) {
        Object.entries(params).forEach(([key, value]) => {
            if(detail.includes(key)){
                const replaceStr = '${' + key + '}'
                newDetail = newDetail.replace(replaceStr, value);
                resultParams[key] = value;
            }
        });
    }
    return { detail: newDetail, params: resultParams };
}

const formatDoc = (doc) => {
    let newDoc = {};
    for (let i=0; i<doc.types.length; i++) {
        let typeObject = doc.types[i];
        let typeValue = Object.values(typeObject)[0];
        newDoc[TYPE_CONST + typeValue.type_code] = {
            type_code: typeValue.type_code,
            type: typeValue.type,
            title: typeValue.title
        }
        for(let j=0; j<typeValue.instances.length; j++) {
            let instanceObject = typeValue.instances[j];
            let instanceValue = Object.values(instanceObject)[0];
            newDoc[TYPE_CONST + typeValue.type_code][INSTANCE_CONST + instanceValue.instance_code] = {
                instance_code: instanceValue.instance_code,
                instance: instanceValue.instance,
                detail: instanceValue.detail
            }
        }
    }
    return newDoc;
}

module.exports = MessageInfo;
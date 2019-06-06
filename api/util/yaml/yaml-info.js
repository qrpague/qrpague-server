const YAMLReader = require('./yaml-reader');

const YAMLInfo = class YAMLInfo {

    constructor(yamlFilePath) {
        this.doc = YAMLReader.readYAML(yamlFilePath);
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

    let type = doc[YAMLReader.Constants.TYPE_CONST + typeCode];
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
        instance = type[YAMLReader.Constants.INSTANCE_CONST + instanceCode];
        if(instance){
            const detail = buildDetail(instance.detail, params);
            result = {
                ...result,
                instanceCode: instance.instance_code,
                instance: instance.instance,
                detail: detail
            }
        }

    }

    return result;
}

const buildDetail = (detail, params) => {
    let newDetail = detail;
    Object.entries(params).forEach(([key, value]) => {
        if(detail.includes(key)){
            const replaceStr = '${' + key + '}'
            newDetail = newDetail.replace(replaceStr, value);
        }
    });
    return newDetail;
}

module.exports = YAMLInfo;
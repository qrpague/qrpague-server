const { YAMLReader } = require('../../util');
const path = require('path');

const INST_CONST = 'I_';

const InstituicaoInfo = class InstituicaoInfo {

    constructor(yamlFilePath) {
        const schemaValidatorFilePath = path.join(__dirname, 'instituicao-schema.json');
        this.doc = formatDoc(YAMLReader.readYAML(yamlFilePath, schemaValidatorFilePath));
    }

    find(cnpj) {
        return retrieve({
            doc: this.doc,
            cnpj
        });
    }
}

const retrieve = ({ doc, cnpj }) => {

    let instituicao = doc[INST_CONST + cnpj];
    let instance;

    if(!instituicao) {
        return undefined;
    }
    
    let result = {
        nome: instituicao.nome,
        cnpj: instituicao.cnpj
    }

    return result;
}

const formatDoc = (doc) => {
    let newDoc = {};
    for (let i=0; i<doc.instituicoes.length; i++) {
        let instituicaoObject = doc.instituicoes[i];
        let instituicaoValue = Object.values(instituicaoObject)[0];
        newDoc[INST_CONST + instituicaoValue.cnpj] = {
            nome: instituicaoValue.nome,
            cnpj: instituicaoValue.cnpj
        }
    }
    return newDoc;
}

module.exports = InstituicaoInfo;
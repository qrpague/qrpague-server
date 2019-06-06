const yaml = require('js-yaml'),
      fs   = require('fs'),
      path = require('path'),
      Ajv = require('ajv');

const ENCODE = 'utf8';

const TYPE_CONST = 'T_',
      INSTANCE_CONST = 'C_';

const validate = (doc) => {
    const jsonFile = fs.readFileSync(path.join(__dirname, 'json-schema-validator.json'), ENCODE);
    const schema = JSON.parse(jsonFile);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(doc);
    if (!valid) 
        throw new Error(validate.errors);
    return doc;
}

const readYAML = (filePath) => {
    const yamlFile = fs.readFileSync(filePath, ENCODE);
    let doc = yaml.safeLoad(yamlFile);
    validate(doc);
    doc = formatDoc(doc);
    return doc;
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

module.exports = {
    readYAML,
    Constants: { INSTANCE_CONST, TYPE_CONST }
}
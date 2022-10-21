const db = require("../models")

const iterateRecordsWith = async (fn) => {
    const countRecords = await db.Record.count();
    for (let i = 0; i < countRecords; i++) {
        const record = await db.Record.findOne({
            offset: i,
        });
        if (record.status !== 'included' || record.deletedAt !== null) {
            continue;
        }
        await fn(record)
    }
}

const getMappingOptions = async (title, record = null) => {
    const question = await db.MappingQuestion.findOne({where: {title}})
    if (record) {
        return await record.getMappingOptions({where: {mappingQuestionId: question.id}})
    }
    return await db.MappingOption.findAll({where: {mappingQuestionId: question.id}})
} 

module.exports = {iterateRecordsWith, getMappingOptions}

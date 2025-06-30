const Synonym = require('./models');

exports.getAllSynonyms = async () => Synonym.find();

exports.createSynonym = async (data) => Synonym.create(data);

exports.getSynonymById = async (id) => Synonym.findById(id);

exports.updateSynonym = async (id, data) => Synonym.findByIdAndUpdate(id, data, { new: true });

exports.deleteSynonym = async (id) => Synonym.findByIdAndDelete(id);

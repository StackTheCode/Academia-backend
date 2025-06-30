const Professor = require('./models');
const typesenseClient = require('../../config/typesense');
const logger = require('../../config/logger');

exports.getAllProfessors = async (filters) => {
  const filterParts = [];
  if (filters.departmentId) filterParts.push(`departmentId:=${filters.departmentId}`);
  if (filters.collegeId) filterParts.push(`collegeId:=${filters.collegeId}`);
  const filter_by = filterParts.join(' && ');
  const page = filters.page || 1;
  const per_page = filters.per_page || 10;
  const query_by = filters.q ? 'researchInterests' : 'name';

  const searchOptions = {
    q: filters.q || '*',
    query_by,
    ...(filter_by && { filter_by }),
    page,
    per_page,
  };

  try {
    const searchResult = await typesenseClient
      .collections('professors')
      .documents()
      .search(searchOptions);

    const ids = searchResult.hits.map((hit) => hit.document.id);
    const professors = await Professor.find({ _id: { $in: ids } })
      .populate('collegeId', 'name')
      .populate('departmentId', 'name')
      .lean();

    const ordered = ids
      .map((id) => professors.find((prof) => prof._id.toString() === id))
      .filter(Boolean);

    return {
      professors: ordered,
      total: searchResult.found,
      page,
      per_page,
    };
  } catch (err) {
    logger.error('❌ Typesense search failed:', err.message);
    return { professors: [], total: 0, page, per_page };
  }
};

exports.createProfessor = async (data) => Professor.create(data);

exports.getProfessorById = async (id) => Professor.findById(id).populate('collegeId departmentId');

exports.updateProfessor = async (id, data) => Professor.findByIdAndUpdate(id, data, { new: true });

exports.deleteProfessor = async (id) => Professor.findByIdAndDelete(id);

exports.getAllProfessorsByIds = async (profObjectIds) =>
  Professor.find({ _id: { $in: profObjectIds } }).populate('collegeId');

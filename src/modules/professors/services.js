const Professor = require('./models');
const typesenseClient = require('../../config/typesense');

exports.getAllProfessors = async (filters) => {
  const filterParts = [];
  if (filters.departmentId) filterParts.push(`departmentId:=${filters.departmentId}`);
  if (filters.collegeId) filterParts.push(`collegeId:=${filters.collegeId}`);
  const filter_by = filterParts.join(' && ');
  const query_by = filters.q ? 'researchInterests' : 'name'; // fallback is required

  const searchOptions = {
    q: filters.q || '*',
    query_by,
    ...(filter_by && { filter_by }),
  };

  try {
    const searchResult = await typesenseClient
      .collections('professors')
      .documents()
      .search(searchOptions);

    const ids = searchResult.hits.map((hit) => hit.document.id);

    // Get full documents from MongoDB
    const professors = await Professor.find({ _id: { $in: ids } }).populate(
      'collegeId departmentId'
    );

    // Preserve Typesense hit order
    const ordered = ids
      .map((id) => professors.find((prof) => prof._id.toString() === id))
      .filter(Boolean);

    return ordered;
  } catch (err) {
    console.error('❌ Typesense search failed:', err.message);
    return [];
  }
};

exports.createProfessor = async (data) => Professor.create(data);

exports.getProfessorById = async (id) => Professor.findById(id).populate('collegeId departmentId');

exports.updateProfessor = async (id, data) => Professor.findByIdAndUpdate(id, data, { new: true });

exports.deleteProfessor = async (id) => Professor.findByIdAndDelete(id);

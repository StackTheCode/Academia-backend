const GoogleUser = require('./models');

// Fetch all users
exports.getAllUsers = async () => {
  return await GoogleUser.find();
};

// Create a user
exports.createUser = async (userData) => {
  return await GoogleUser.create(userData);
};

// Find user by ID
exports.getUserById = async (id) => {
  return await GoogleUser.findById(id);
};

// Update user
exports.updateUser = async (id, data) => {
  return await GoogleUser.findByIdAndUpdate(id, data, { new: true });
};

// Delete user
exports.deleteUser = async (id) => {
  return await GoogleUser.findByIdAndDelete(id);
};

const User = require('./models');

// Fetch all users
exports.getAllUsers = async () => {
  return await User.find();
};

// Create a user
exports.createUser = async (userData) => {
  return await User.create(userData);
};

// Find user by ID
exports.getUserById = async (id) => {
  return await User.findById(id);
};

// Update user
exports.updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// Delete user
exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

const userService = require('./services');
const fs = require('fs');

// GET /api/auth
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST /api/auth
exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/auth/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/auth/:id
exports.updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/auth/:id
exports.deleteUser = async (req, res) => {
  try {
    console.log(req.user);
    await userService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// GET /api/auth/files
exports.getAllFiles = async (req, res) => {
  try {
    const googleId = req.user.googleId;
    const uploadedFiles = await userService.getAllFiles(googleId);

    return res.status(200).json({ uploadedFiles });
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('Unexpected error in getAllFiles:', err);
    return res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// POST /api/auth/files/create
exports.createFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = await userService.createFile(req.file, req.user.googleId);
    res.status(201).json({ message: 'File uploaded successfully', url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/files/get-one/:file
exports.getFile = async (req, res) => {
  try {
    const fileUrl = await userService.getFile(req.params.file, req.user.googleId);
    res.json({ url: fileUrl });
  } catch (err) {
    if (err.message === 'File not found') {
      return res.status(403).json({ error: err.message });
    } else if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    } else {
      return res.status(500).json({ error: 'Server error' });
    }
  }
};

// DELETE /api/auth/files/delete/:file
exports.deleteFile = async (req, res) => {
  try {
    await userService.deleteFile(req.params.file, req.user.googleId);
    res.status(204).end();
  } catch (err) {
    if (err.message === 'File not found') {
      return res.status(403).json({ error: err.message });
    } else if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    } else {
      return res.status(500).json({ error: 'Server error' });
    }
  }
};

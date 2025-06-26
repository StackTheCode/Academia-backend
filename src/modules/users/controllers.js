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

// PUT /api/auth
exports.updateUser = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/auth
exports.deleteUser = async (req, res) => {
  try {
    console.log(req.user);
    await userService.deleteUser(req.user.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

// GET /api/auth/files
exports.getAllFiles = async (req, res) => {
  try {
    console.log(req.user.id);
    const uploadedFiles = await userService.getAllFiles(req.user.id);
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

    await userService.createFile(req.file, req.user.id);
    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/files/get-one/:file
exports.getFile = async (req, res) => {
  try {
    const fileUrl = await userService.getFile(req.params.file, req.user.id);
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
    await userService.deleteFile(req.params.file, req.user.id);
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

// POST /api/auth/signup
exports.signUp = async (req, res) => {
  try {
    const message = await userService.signUp(req.body, 'user');
    res.status(202).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//POST /api/auth/admin/signup
exports.adminSignUp = async (req, res) => {
  try {
    const message = await userService.signUp(req.body, 'admin');
    res.status(202).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//POST /api/auth/verifyOTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await userService.verifyOTP(email, otp);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { user, token } = await userService.login(req.body);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

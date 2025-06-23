const fs = require('fs');
const path = require('path');
const GoogleUser = require('./models');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { BUCKET_NAME, BUCKET_REGION, ACCESS_KEY, SECRET_ACCESS_KEY } = require('../../config/env');

const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

const redis = require('../../config/redis');

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

exports.getAllFiles = async (googleId) => {
  const user = await GoogleUser.findOne({ googleId });
  if (!user) {
    throw new Error('User not found');
  }
  return user.uploadedFiles;
};

exports.createFile = async (file, googleId) => {
  const newFileName = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: newFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  const user = await GoogleUser.findOne({ googleId });
  if (!user) {
    throw new Error('User not found');
  }
  user.uploadedFiles.push(newFileName);
  await user.save();
};

exports.getFile = async (file, googleId) => {
  const user = await GoogleUser.findOne({ googleId });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.uploadedFiles.includes(file)) {
    throw new Error('File not found');
  }

  const cacheKey = `fileUrl:${file}`;
  const cachedUrl = await redis.get(cacheKey);

  if (cachedUrl) {
    console.log('Already Present');
    return cachedUrl;
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: file,
  };
  const command = new GetObjectCommand(params);
  fileUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  await redis.set(cacheKey, fileUrl, 'EX', 3600);
  return fileUrl;
};

exports.deleteFile = async (file, googleId) => {
  const user = await GoogleUser.findOne({ googleId });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.uploadedFiles.includes(file)) {
    throw new Error('File not found');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: file,
  };
  const command = new DeleteObjectCommand(params);
  await s3.send(command);

  user.uploadedFiles = user.uploadedFiles.filter((f) => f !== file);
  await user.save();

  const cacheKey = `fileUrl:${file}`;
  const cachedUrl = await redis.get(cacheKey);

  if (cachedUrl) {
    await redis.del(cacheKey);
    console.log('Deleted file from cache');
  }
};

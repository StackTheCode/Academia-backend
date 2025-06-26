const fs = require('fs');
const path = require('path');
const User = require('./models');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { BUCKET_NAME, JWT_SECRET, SES_VERIFIED_EMAIL } = require('../../config/env');

const redis = require('../../config/redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const aws = require('../../config/aws');

// Fetch all users
exports.getAllUsers = async () => {
  return await User.find();
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

exports.getAllFiles = async (id) => {
  console.log(id);
  const user = await User.findOne({ id });
  if (!user) {
    throw new Error('User not found');
  }
  return user.uploadedFiles;
};

exports.createFile = async (file, id) => {
  const newFileName = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: newFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await aws.s3.send(command);

  const user = await User.findOne({ id });
  if (!user) {
    throw new Error('User not found');
  }
  user.uploadedFiles.push(newFileName);
  await user.save();
};

exports.getFile = async (file, id) => {
  const user = await User.findOne({ id });

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
  fileUrl = await getSignedUrl(aws.s3, command, { expiresIn: 3600 });
  await redis.set(cacheKey, fileUrl, 'EX', 3600);
  return fileUrl;
};

exports.deleteFile = async (file, id) => {
  const user = await User.findOne({ id });

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
  await aws.s3.send(command);

  user.uploadedFiles = user.uploadedFiles.filter((f) => f !== file);
  await user.save();

  const cacheKey = `fileUrl:${file}`;
  const cachedUrl = await redis.get(cacheKey);

  if (cachedUrl) {
    await redis.del(cacheKey);
    console.log('Deleted file from cache');
  }
};

exports.signUp = async (userData, role) => {
  const { email, password, displayName } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const cacheKey = `otp:${email}`;
  await redis.set(cacheKey, JSON.stringify({ otp, password, displayName, role }), 'EX', 300);

  const emailParams = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Your verification code is: ${otp}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Your Email Verification Code',
      },
    },
    Source: SES_VERIFIED_EMAIL,
  };

  try {
    const command = new SendEmailCommand(emailParams);
    const res = await aws.ses.send(command);
    console.log('Email has been sent', res);
  } catch (err) {
    console.log(err);
    await redis.del(cacheKey);
    throw new Error('Failed to send verification email');
  }

  return { message: 'OTP sent to email. Please verify to continue.' };
};

exports.verifyOTP = async (email, clientOTP) => {
  const cacheKey = `otp:${email}`;
  const cachedData = await redis.get(cacheKey);

  if (!cachedData) {
    throw new Error('OTP expired or not found');
  }

  const { otp, password, displayName, role } = JSON.parse(cachedData);

  if (otp !== clientOTP) {
    throw new Error('Wrong OTP');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    email: email,
    password: hashedPassword,
    displayName: displayName,
    role: role,
  });

  await redis.del(cacheKey);
  console.log('Signup Successful');
  return newUser;
};

exports.login = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email }).select('+password');
  if (!existingUser) {
    throw new Error('Email does not exist');
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    console.log('Invalid password');
    throw new Error('Wrong Password');
  }
  console.log('Password is correct');
  const token = jwt.sign(
    {
      id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { existingUser, token };
};

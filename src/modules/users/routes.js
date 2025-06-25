const { resolve } = require('bluebird');
const express = require('express');
const { PORT, JWT_SECRET, FRONTEND_URI } = require('../../config/env');
const passport = require('passport');
const router = express.Router();
const userController = require('./controllers');
const authenticateJWT = require('../../middleware/auth');
const authenticateAdmin = require('../../middleware/admin');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swaggeruse
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects the user to Google's OAuth consent screen
 */
router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects to dashboard on successful authentication or to home on failure
 *       401:
 *         description: Unauthorized – Google authentication failed
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URI}`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Redirect with token to frontend
    res.redirect(`${FRONTEND_URI}/dashboard?token=${token}`);
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout the user
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirects to homepage after logging out
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    sameSite: 'Lax', // or 'Strict'/'None' based on frontend/backend setup
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 */
router.get('/', authenticateJWT, authenticateAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/auth/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateJWT, userController.getUserById);

/**
 * @swagger
 * /api/auth:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/', authenticateJWT, userController.updateUser);

/**
 * @swagger
 * /api/auth/{id}:
 *   delete:
 *     summary: Delete user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/', authenticateJWT, userController.deleteUser);

/**
 * @swagger
 * /api/auth/files/get-all:
 *   get:
 *     summary: Get all uploaded files for the authenticated user
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of uploaded files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadedFiles:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/files/get-all', authenticateJWT, userController.getAllFiles);

/**
 * @swagger
 * /api/auth/files/create:
 *   post:
 *     summary: Upload a file to S3 and associate it with the authenticated user
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (e.g., PDF)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded and added to user profile
 *                 url:
 *                   type: string
 *                   example: https://your-bucket.s3.region.amazonaws.com/filename.pdf
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/files/create', authenticateJWT, upload.single('file'), userController.createFile);

/**
 * @swagger
 * /api/auth/files/get-one/{filename}:
 *   get:
 *     summary: Get a signed URL to access a file (if the authenticated user owns it)
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the uploaded file in S3 (e.g., 1718876890234-resume.pdf)
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://your-bucket.s3.amazonaws.com/filename.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256...
 *       403:
 *         description: Forbidden – the file does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You do not have access to this file
 *       404:
 *         description: File or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found or user not found
 *       500:
 *         description: Internal server error
 */
router.get('/files/get-one/:file', authenticateJWT, userController.getFile);

/**
 * @swagger
 * /api/auth/files/delete/{filename}:
 *   delete:
 *     summary: Delete a file from S3 and remove its reference from the user's profile
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to delete from S3 (e.g., 1718876890234-resume.pdf)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *       403:
 *         description: Forbidden – the file does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You do not have access to this file
 *       404:
 *         description: File or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/files/delete/:file', authenticateJWT, userController.deleteFile);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - email
 *               - password
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       202:
 *         description: OTP Sent Successfully
 */
router.post('/signup', userController.signUp);

/**
 * @swagger
 * /api/auth/admin/signup:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - email
 *               - password
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       202:
 *         description: OTP Sent Successfully
 */
router.post('/admin/signup', userController.adminSignUp);

/**
 * @swagger
 * /api/auth/verifyOTP:
 *   post:
 *     summary: Verify OTP to complete user registration
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User created successfully after OTP verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 userId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *       400:
 *         description: Invalid OTP or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid OTP
 */
router.post('/verifyOTP', userController.verifyOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Normal Login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login Successful
 */
router.post('/login', userController.login);

module.exports = router;

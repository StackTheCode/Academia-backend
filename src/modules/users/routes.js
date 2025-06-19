const { resolve } = require('bluebird');
const express = require('express');
const { PORT, JWT_SECRET, FRONTEND_URI } = require('../../config/env');
const passport = require('passport');
const router = express.Router();
const userController = require('./controllers');
const authenticateJWT = require('../../middleware/auth'); // <--- Add this
const jwt = require('jsonwebtoken');

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
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile'] }));

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
    const token = jwt.sign({ id: req.user.id, googleId: req.user.googleId }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send token to frontend via redirect URL
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
router.get('/', userController.getAllUsers);
/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleId
 *               - displayName
 *             properties:
 *               googleId:
 *                 type: string
 *               displayName:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', userController.createUser);

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
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /api/auth/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleId:
 *                 type: string
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
router.put('/:id', authenticateJWT, userController.updateUser);

/**
 * @swagger
 * /api/auth/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateJWT, userController.deleteUser);

module.exports = router;

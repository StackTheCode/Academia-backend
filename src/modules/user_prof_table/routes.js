const express = require('express');
const router = express.Router();
const userProfController = require('./controllers');
const authenticateJWT = require('../../middleware/auth');
/**
 * @swagger
 * /api/user-Prof:
 *   get:
 *     summary: Get all user-professor entries
 *     tags:
 *       - UserProf
 *     responses:
 *       200:
 *         description: Successfully retrieved entries
 */
router.get('/', authenticateJWT, userProfController.getAllUserProfEntries);

/**
 * @swagger
 * /api/user-Prof:
 *   post:
 *     summary: Create a new user-professor entry
 *     tags:
 *       - UserProf
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               professorId:
 *                 type: string
 *               contacted:
 *                 type: boolean
 *               responded:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Entry created successfully
 */
router.post('/', authenticateJWT, userProfController.createUserProfEntry);

/**
 * @swagger
 * /api/user-Prof/{id}:
 *   get:
 *     summary: Get a user-professor entry by ID
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the entry to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry retrieved successfully
 *       404:
 *         description: Entry not found
 */
router.get('/:id', authenticateJWT, userProfController.getUserProfEntryById);

/**
 * @swagger
 * /api/user-Prof/user/batch:
 *   get:
 *     summary: Get all entries by user ID
 *     tags:
 *       - UserProf
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *       404:
 *         description: Entries not found
 */
router.get('/user/batch', authenticateJWT, userProfController.getUserProfEntriesByUserId);

/**
 * @swagger
 * /api/user-Prof/professor/{professorId}:
 *   get:
 *     summary: Get all entries by professor ID
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: professorId
 *         required: true
 *         description: ID of the professor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *       404:
 *         description: Entries not found
 */
router.get(
  '/professor/:professorId',
  authenticateJWT,
  userProfController.getUserProfEntriesByProfessorId
);

/**
 * @swagger
 * /api/user-Prof/{id}:
 *   put:
 *     summary: Update a user-professor entry by ID
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the entry to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contacted:
 *                 type: boolean
 *               responded:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *       404:
 *         description: Entry not found
 */
router.put('/:id', authenticateJWT, userProfController.updateUserProfEntry);

/**
 * @swagger
 * /api/user-Prof/{id}:
 *   delete:
 *     summary: Delete a user-professor entry by ID
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry deleted successfully
 *       404:
 *         description: Entry not found
 */
router.delete('/:id', authenticateJWT, userProfController.deleteUserProfEntry);

/**
 * @swagger
 * /api/user-Prof/batch:
 *   post:
 *     summary: Batch insert professor entries for a user by ID
 *     tags:
 *       - UserProf
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example: ["64a7e8d9c2f9a7f0d4b01234", "64a7e8d9c2f9a7f0d4b05678"]
 *     responses:
 *       201:
 *         description: Successfully inserted new entries
 *       200:
 *         description: No new entries to insert
 *       500:
 *         description: Failed to insert batch entries
 */
router.post('/batch', authenticateJWT, userProfController.insertBatchEntry);

module.exports = router;

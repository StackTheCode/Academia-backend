const express = require('express');
const router = express.Router();
const userProfController = require('./controllers');

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
router.get('/', userProfController.getAllUserProfEntries);

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
router.post('/', userProfController.createUserProfEntry);

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
router.get('/:id', userProfController.getUserProfEntryById);

/**
 * @swagger
 * /api/user-Prof/user/{userId}:
 *   get:
 *     summary: Get all entries by user ID
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 */
router.get('/user/:userId', userProfController.getUserProfEntriesByUserId);

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
 */
router.get('/professor/:professorId', userProfController.getUserProfEntriesByProfessorId);

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
router.put('/:id', userProfController.updateUserProfEntry);

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
router.delete('/:id', userProfController.deleteUserProfEntry);

/**
 * @swagger
 * /api/user-Prof/batch/{userId}:
 *   post:
 *     summary: Batch insert professor entries for a user
 *     tags:
 *       - UserProf
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
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
router.post('/batch/:userId', userProfController.insertBatchEntry);

module.exports = router;

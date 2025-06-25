const express = require('express');
const router = express.Router();
const synonymController = require('./controllers');
const authenticateJWT = require('../../middleware/auth');
const authenticateAdmin = require('../../middleware/admin');

/**
 * @swagger
 * /api/synonyms:
 *   get:
 *     summary: Get all synonyms
 *     tags:
 *       - Synonyms
 *     responses:
 *       200:
 *         description: Successfully retrieved synonyms
 */
router.get('/', synonymController.getAllSynonyms);

/**
 * @swagger
 * /api/synonyms:
 *   post:
 *     summary: Create a new synonym group
 *     tags:
 *       - Synonyms
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - synonyms
 *             properties:
 *               name:
 *                 type: string
 *                 example: cybersecurity_group
 *               synonyms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cybersecurity", "security", "cyber physical security"]
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Synonym group created successfully
 */
router.post('/', authenticateJWT, authenticateAdmin, synonymController.createSynonym);

/**
 * @swagger
 * /api/synonyms/{id}:
 *   get:
 *     summary: Get a synonym by ID
 *     tags:
 *       - Synonyms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the synonym to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Synonym retrieved successfully
 *       404:
 *         description: Synonym not found
 */
router.get('/:id', synonymController.getSynonymById);

/**
 * @swagger
 * /api/synonyms/{name}:
 *   put:
 *     summary: Update a synonym group by name
 *     tags:
 *       - Synonyms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: id of the synonym group to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               synonyms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cybersecurity", "AI security"]
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Synonym group updated successfully
 */
router.put('/:id', synonymController.updateSynonym);

/**
 * @swagger
 * /api/synonyms/{id}:
 *   delete:
 *     summary: Delete a synonym by ID
 *     tags:
 *       - Synonyms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the synonym to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Synonym deleted successfully
 */
router.delete('/:id', authenticateJWT, authenticateAdmin, synonymController.deleteSynonym);

module.exports = router;

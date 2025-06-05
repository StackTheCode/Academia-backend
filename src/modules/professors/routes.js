const express = require('express');
const router = express.Router();
const professorController = require('./controllers');

/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: Get all professors
 *     tags:
 *       - Professors
 *     responses:
 *       200:
 *         description: Successfully retrieved professors
 */
router.get('/', professorController.getAllProfessors);

/**
 * @swagger
 * /api/professors:
 *   post:
 *     summary: Create a new professor
 *     tags:
 *       - Professors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               collegeId:
 *                 type: string
 *                 example: 645a23b9d1f8c2a1f1a23bc5
 *               departmentId:
 *                 type: string
 *                 example: 645a23b9d1f8c2a1f1a23bc6
 *               researchInterests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["machine learning", "AI"]
 *               position:
 *                 type: string
 *                 example: Head of Department
 *     responses:
 *       201:
 *         description: Professor created successfully
 */
router.post('/', professorController.createProfessor);

/**
 * @swagger
 * /api/professors/{id}:
 *   get:
 *     summary: Get a professor by ID
 *     tags:
 *       - Professors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the professor to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Professor retrieved successfully
 *       404:
 *         description: Professor not found
 */
router.get('/:id', professorController.getProfessorById);

/**
 * @swagger
 * /api/professors/{id}:
 *   put:
 *     summary: Update a professor by ID
 *     tags:
 *       - Professors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the professor to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               collegeId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               researchInterests:
 *                 type: array
 *                 items:
 *                   type: string
 *               position:
 *                 type: string
 *     responses:
 *       200:
 *         description: Professor updated successfully
 */
router.put('/:id', professorController.updateProfessor);

/**
 * @swagger
 * /api/professors/{id}:
 *   delete:
 *     summary: Delete a professor by ID
 *     tags:
 *       - Professors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the professor to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Professor deleted successfully
 */
router.delete('/:id', professorController.deleteProfessor);

module.exports = router;

const express = require('express');
const router = express.Router();
const professorController = require('./controllers');
const Professor = require('./models');
const typesenseClient = require('../../config/typesense');
const authenticateJWT = require('../../middleware/auth');
const authenticateAdmin = require('../../middleware/admin');

/**
 * @swagger
 * components:
 *   schemas:
 *     Professor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665f2f6b9123abcde1234567"
 *         name:
 *           type: string
 *           example: "Dr. John Doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         collegeId:
 *           type: string
 *           example: "645a23b9d1f8c2a1f1a23bc5"
 *         departmentId:
 *           type: string
 *           example: "645a23b9d1f8c2a1f1a23bc6"
 *         researchInterests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["machine learning", "AI"]
 *         personal_website:
 *           type: string
 *           example: "https://johndoe.com"
 *         college_website:
 *           type: string
 *           example: "https://iitm.ac.in"
 *         position:
 *           type: string
 *           example: "Professor"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.get('/', professorController.getAllProfessors);
/**
 * @swagger
 * /api/professors:
 *   get:
 *     summary: Get all professors, optionally filtered by collegeId, departmentId, and research interest
 *     tags:
 *       - Professors
 *     parameters:
 *       - in: query
 *         name: collegeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved professors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 professors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Professor'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 per_page:
 *                   type: integer
 */

router.post('/', authenticateJWT, authenticateAdmin, professorController.createProfessor);
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
 *             $ref: '#/components/schemas/Professor'
 *     responses:
 *       201:
 *         description: Professor created successfully
 */

router.get('/:id', professorController.getProfessorById);
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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Professor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Professor'
 *       404:
 *         description: Professor not found
 */

router.put('/:id', authenticateJWT, authenticateAdmin, professorController.updateProfessor);
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
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Professor'
 *     responses:
 *       200:
 *         description: Professor updated successfully
 */

router.delete('/:id', authenticateJWT, authenticateAdmin, professorController.deleteProfessor);
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
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Professor deleted successfully
 */

router.post('/resync', authenticateJWT, authenticateAdmin, async (req, res) => {
  try {
    const professors = await Professor.find();
    for (const doc of professors) {
      await typesenseClient
        .collections('professors')
        .documents()
        .upsert({
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          collegeId: doc.collegeId.toString(),
          departmentId: doc.departmentId.toString(),
          researchInterests: doc.researchInterests,
          position: doc.position || '',
          personal_website: doc.personal_website || '',
          college_website: doc.college_website || '',
        });
    }
    res.status(200).json({ message: 'Resync complete.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @swagger
 * /api/professors/resync:
 *   post:
 *     summary: Resync all professors from MongoDB to Typesense
 *     tags:
 *       - Professors
 *     responses:
 *       200:
 *         description: All professors resynced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error while syncing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post('/batch', professorController.getProfessorsByIds);
/**
 * @swagger
 * /api/professors/batch:
 *   post:
 *     summary: Retrieve multiple professors by their IDs
 *     tags:
 *       - Professors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               example: 665f2f6b9123abcde1234567
 *     responses:
 *       200:
 *         description: Successfully retrieved professor details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Professor'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

module.exports = router;

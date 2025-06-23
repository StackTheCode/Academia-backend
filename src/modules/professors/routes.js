const express = require('express');
const router = express.Router();
const professorController = require('./controllers');
const Professor = require('./models');
const typesenseClient = require('../../config/typesense');

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
 *         description: Filter professors by college ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter professors by department ID
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Fuzzy search professors by research interest (e.g., "cybersecurity")
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for paginated results
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Number of professors per page
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
 *                   description: Total number of matching professors
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 per_page:
 *                   type: integer
 *                   description: Number of results per page
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

/**
 * @swagger
 * /api/professors/resync:
 *   post:
 *     summary: Resync all professors from MongoDB to Typesense
 *     tags:
 *       - Professors
 *     description: This endpoint fetches all professors from MongoDB and upserts them into the Typesense collection.
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
 *                   example: Resync complete.
 *       500:
 *         description: Server error while syncing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/resync', async (req, res) => {
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
        });
    }
    res.status(200).json({ message: 'Resync complete.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

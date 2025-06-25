const express = require('express');
const router = express.Router();
const collegeController = require('./controllers');
const authenticateJWT = require('../../middleware/auth');
const authenticateAdmin = require('../../middleware/admin');

/**
 * @swagger
 * /api/colleges:
 *   get:
 *     summary: Get all colleges
 *     tags:
 *       - Colleges
 *     responses:
 *       200:
 *         description: Successfully retrieved colleges
 */
router.get('/', collegeController.getAllColleges);

/**
 * @swagger
 * /api/colleges:
 *   post:
 *     summary: Create a new college
 *     tags:
 *       - Colleges
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: IIT Bombay
 *               location:
 *                 type: string
 *                 example: Mumbai
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["68430b1bcfe0f5ce1fd9c87b", "68430b1bcfe0f5ce1fd9c87b"]
 *     responses:
 *       201:
 *         description: College created successfully
 */
router.post('/', authenticateJWT, authenticateAdmin, collegeController.createCollege);

/**
 * @swagger
 * /api/colleges/{id}:
 *   get:
 *     summary: Get a college by ID
 *     tags:
 *       - Colleges
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the college to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: College retrieved successfully
 *       404:
 *         description: College not found
 */
router.get('/:id', collegeController.getCollegeById);

/**
 * @swagger
 * /api/colleges/{id}:
 *   put:
 *     summary: Update a college by ID
 *     tags:
 *       - Colleges
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the college to update
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
 *               location:
 *                 type: string
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: College updated successfully
 */
router.put('/:id', authenticateJWT, authenticateAdmin, collegeController.updateCollege);

/**
 * @swagger
 * /api/colleges/{id}:
 *   delete:
 *     summary: Delete a college by ID
 *     tags:
 *       - Colleges
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the college to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: College deleted successfully
 */
router.delete('/:id', authenticateJWT, authenticateAdmin, collegeController.deleteCollege);

module.exports = router;

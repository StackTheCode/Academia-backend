const express = require('express');
const router = express.Router();
const departmentController = require('./controllers');
const authenticateJWT = require('../../middleware/auth');
const authenticateAdmin = require('../../middleware/admin');

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags:
 *       - Departments
 *     responses:
 *       200:
 *         description: Successfully retrieved departments
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags:
 *       - Departments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science and Engineering
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post('/', authenticateJWT, authenticateAdmin, departmentController.createDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the department to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department by ID
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the department to update
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
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put('/:id', authenticateJWT, authenticateAdmin, departmentController.updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department by ID
 *     tags:
 *       - Departments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the department to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Department deleted successfully
 */
router.delete('/:id', authenticateJWT, authenticateAdmin, departmentController.deleteDepartment);

module.exports = router;

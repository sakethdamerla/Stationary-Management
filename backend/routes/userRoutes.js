const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// POST /api/users/register -> Register a new student
router.post('/users/register', registerUser);

// GET /api/users -> Get all students
router.get('/users', getUsers);

// PUT /api/users/:id -> Update a student's items/paid status
router.put('/users/:id', updateUser);

// DELETE /api/users/:id -> Delete a student
router.delete('/users/:id', deleteUser);

module.exports = router;

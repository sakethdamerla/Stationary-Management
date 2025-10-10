const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
// Ensure Order model is registered so populate('orders') can resolve
require('../models/orderModel');

/**
 * @desc    Register a new user/student
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, course, year } = req.body;

  // Check if a user with the same email or studentId already exists
  const userExists = await User.findOne({ $or: [{ email }, { studentId }] });

  if (userExists) {
    res.status(400);
    let message = 'User already exists.';
    if (userExists.email === email) {
      message = 'User with this email already exists.';
    } else if (userExists.studentId === studentId) {
      message = 'User with this student ID already exists.';
    }
    throw new Error(message);
  }

  const user = await User.create({
      name,
      email,
      password,
      studentId,
      course,
      year,
    });

  if (user) {
    // Respond with the created user's data (password is not sent due to 'select: false' in model)
    res.status(201).json({ user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      course: user.course,
      year: user.year,
      role: user.role,
      items: user.items,
      paid: user.paid,
    }});
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Get all users/students
 * @route   GET /api/users
 * @access  Private/Admin (Should be protected in a real app)
 */
const getUsers = asyncHandler(async (req, res) => {
  // Populate orders for each user, and then populate the products within each order's orderItems
  const users = await User.find({}).populate({
    path: 'orders',
    populate: {
      path: 'orderItems.product',
      model: 'Product',
    },
  });
  res.status(200).json(users);
});

/**
 * @desc    Update a user's items/paid status
 * @route   PUT /api/users/:id
 * @access  Public
 */
const updateUser = asyncHandler(async (req, res) => {
  const { items, paid, name, studentId, course, year, branch } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // allow profile updates (name, studentId, course, year, branch) and items/paid
  if (items !== undefined) user.items = items;
  if (paid !== undefined) user.paid = paid;
  if (name !== undefined) user.name = name;
  if (studentId !== undefined) user.studentId = studentId;
  if (course !== undefined) user.course = course;
  if (year !== undefined) user.year = year;
  if (branch !== undefined) user.branch = branch;

  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, studentId: updated.studentId, course: updated.course, year: updated.year, branch: updated.branch, items: updated.items, paid: updated.paid });
});

/**
 * @desc    Delete a user/student
 * @route   DELETE /api/users/:id
 * @access  Public
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

/**
 * @desc    Import users from uploaded Excel/CSV file
 * @route   POST /api/users/import
 * @access  Public
 */
const importUsers = asyncHandler(async (req, res) => {
  // multer stores file in memory (buffer)
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const XLSX = require('xlsx');
  const buffer = req.file.buffer;
  // Support CSV and XLSX by delegating to xlsx library
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const imported = [];
  for (const row of rows) {
    // Accept columns: name, studentId, course, year, branch (case-insensitive)
    const name = row.name || row.Name || row.NAME || '';
    const studentId = row.studentId || row.StudentId || row['student id'] || row['Student ID'] || '';
    const course = row.course || row.Course || '';
    const year = row.year || row.Year || '';
    const branch = row.branch || row.Branch || '';

    if (!name || !studentId) {
      // skip rows without required data
      continue;
    }

    // Check existing
    let existing = await User.findOne({ studentId: String(studentId) });
    if (existing) {
      // update basic profile if present
      existing.name = name || existing.name;
      if (course) existing.course = course;
      if (year) existing.year = Number(year) || existing.year;
      if (branch) existing.branch = branch;
      await existing.save();
      imported.push({ _id: existing._id, name: existing.name, studentId: existing.studentId, course: existing.course, year: existing.year, branch: existing.branch });
      continue;
    }

    // Create new user - set a random password placeholder since register normally handles passwords
    const toCreate = { name, studentId: String(studentId), course: course || '', year: year ? Number(year) : undefined, branch: branch || '' };
    try {
      const created = await User.create(toCreate);
      imported.push({ _id: created._id, name: created.name, studentId: created.studentId, course: created.course, year: created.year, branch: created.branch });
    } catch (err) {
      // skip on error but continue
      console.error('Failed to import row', row, err.message);
      continue;
    }
  }

  res.json({ imported });
});

module.exports = { registerUser, getUsers, updateUser, deleteUser, importUsers };

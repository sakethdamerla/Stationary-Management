const express = require('express');
const connectDB = require('./config/db'); // Assuming db.js is in a 'config' folder
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Mount product routes
app.use('/api/products', productRoutes);

// Mount user routes
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

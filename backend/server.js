const express = require('express');
const connectDB = require('./config/db'); // Assuming db.js is in a 'config' folder
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const userRoutes = require('./models/userRoutes');
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

app.listen(5000, () => {
  console.log('Server started on port 5000');
});

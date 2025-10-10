const mongoose = require('mongoose');
//def
// Define the schema for an order
const orderSchema = new mongoose.Schema(
  {
    user: {
      // Store a snapshot of user details at the time of order
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
      name: { type: String, required: true },
      email: { type: String, required: true },
      studentId: { type: String, required: true },
      course: { type: String, required: true },
      year: { type: Number, required: true },
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        imageUrl: { type: String },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product', // Creates a reference to the Product model
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Cash on Delivery',
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
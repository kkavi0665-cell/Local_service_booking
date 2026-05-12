const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electrician',
        'Plumber',
        'Tutor',
        'Carpenter',
        'Painter',
        'Cleaner',
        'Mechanic',
        'Doctor',
        'Nurse',
        'Cook',
        'Driver',
        'Security',
        'Other',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate service (same title + provider)
serviceSchema.index({ title: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Service', serviceSchema);

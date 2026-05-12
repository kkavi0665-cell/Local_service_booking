const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// @route  POST /api/reviews/:serviceId
// @desc   Add or update review
// @access Private (Customer)
router.post('/:serviceId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can write reviews' });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Upsert review
    const review = await Review.findOneAndUpdate(
      { customer: req.user._id, service: req.params.serviceId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    ).populate('customer', 'name');

    // Recalculate average rating
    const reviews = await Review.find({ service: req.params.serviceId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Service.findByIdAndUpdate(req.params.serviceId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  GET /api/reviews/:serviceId
// @desc   Get all reviews for a service
// @access Public
router.get('/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

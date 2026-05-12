const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Review = require('../models/Review');
const { protect, providerOnly } = require('../middleware/auth');

// @route  GET /api/services
// @desc   Get all services with filters
// @access Public
router.get('/', async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, minRating, available } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (available === 'true') query.isAvailable = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const services = await Service.find(query)
      .populate('provider', 'name email location phone')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  GET /api/services/:id
// @desc   Get single service
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'provider',
      'name email location phone'
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const reviews = await Review.find({ service: req.params.id }).populate(
      'customer',
      'name'
    );

    res.json({ service, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  GET /api/services/provider/my-services
// @desc   Get provider's own services
// @access Private (Provider)
router.get('/provider/my-services', protect, providerOnly, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  POST /api/services
// @desc   Create new service
// @access Private (Provider)
router.post('/', protect, providerOnly, async (req, res) => {
  try {
    const { title, category, price, location, description } = req.body;

    if (!title || !category || !price || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Check duplicate
    const exists = await Service.findOne({ title, provider: req.user._id });
    if (exists) {
      return res.status(400).json({ message: 'You already have a service with this title' });
    }

    const service = await Service.create({
      title,
      category,
      price,
      location,
      description,
      provider: req.user._id,
    });

    const populated = await Service.findById(service._id).populate(
      'provider',
      'name email location'
    );
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already have a service with this title' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  PUT /api/services/:id
// @desc   Update service
// @access Private (Provider - own service only)
router.put('/:id', protect, providerOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const { title, category, price, location, description, isAvailable } = req.body;

    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { title, category, price, location, description, isAvailable },
      { new: true, runValidators: true }
    ).populate('provider', 'name email location');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  DELETE /api/services/:id
// @desc   Delete service
// @access Private (Provider - own service only)
router.delete('/:id', protect, providerOnly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (
      service.provider.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

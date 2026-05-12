const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { protect, providerOnly } = require('../middleware/auth');

// @route  GET /api/bookings
// @desc   Get bookings (customer: their bookings, provider: bookings for their services)
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'customer') {
      bookings = await Booking.find({ customer: req.user._id })
        .populate('service', 'title category price location')
        .populate({
          path: 'service',
          populate: { path: 'provider', select: 'name phone' },
        })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'provider') {
      const myServices = await Service.find({ provider: req.user._id }).select('_id');
      const serviceIds = myServices.map((s) => s._id);
      bookings = await Booking.find({ service: { $in: serviceIds } })
        .populate('service', 'title category price location')
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      // Admin
      bookings = await Booking.find()
        .populate('service', 'title category price')
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  GET /api/bookings/:id
// @desc   Get single booking
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('customer', 'name email phone');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  POST /api/bookings
// @desc   Create new booking
// @access Private (Customer)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }

    const { serviceId, bookingDate, bookingTime, notes } = req.body;

    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Validate date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (!service.isAvailable) {
      return res.status(400).json({ message: 'This service is not available' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      service: serviceId,
      bookingDate,
      bookingTime,
      notes,
      totalAmount: service.price,
    });

    const populated = await Booking.findById(booking._id)
      .populate('service', 'title category price location')
      .populate('customer', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  PUT /api/bookings/:id/status
// @desc   Update booking status
// @access Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('service');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider =
      booking.service.provider.toString() === req.user._id.toString();

    // Customer can only cancel
    if (isCustomer && status !== 'Cancelled') {
      return res.status(403).json({ message: 'Customers can only cancel bookings' });
    }

    // Provider can accept, complete, or cancel
    if (isProvider && !['Accepted', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status for provider' });
    }

    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

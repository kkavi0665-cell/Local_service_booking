const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, adminOnly);

// @route  GET /api/admin/stats
// @desc   Get overall stats
// @access Admin only
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });

    res.json({
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      totalBookings,
      pendingBookings,
      completedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  GET /api/admin/users
// @desc   Get all users
// @access Admin only
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  PUT /api/admin/users/:id/toggle
// @desc   Toggle user active status
// @access Admin only
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route  DELETE /api/admin/services/:id
// @desc   Admin delete any service
// @access Admin only
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

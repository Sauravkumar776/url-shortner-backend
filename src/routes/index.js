const express = require('express');
const authRoutes = require('./authRoutes'); 
const urlRoutes = require('./urlRoutes'); 

const router = express.Router();

// Use the imported routes
router.use('/auth', authRoutes);  
router.use('/url', urlRoutes);     

// Export the main router
module.exports = router;

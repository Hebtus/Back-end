const express = require('express');
const authController = require('../controllers/authenticationController');
const promoCodeController = require('../controllers/promoCodeController');

const router = express.Router();

//Restrict to creators
router.use(authController.protect);
router
  .route('/')
  .get(promoCodeController.getAllPromoCodes)
  .post(promoCodeController.createPromoCode);

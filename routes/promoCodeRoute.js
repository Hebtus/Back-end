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

router.post(
  '/csv',
  promoCodeController.uploadCSV.single('csvFile'), //name of field that will be expected from client
  promoCodeController.createPromoCodeCSV
);

module.exports = router;

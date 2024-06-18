const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const authMiddleware = require('../middleware/auth')

router.post('/contribute', authMiddleware,contributionController.createContribution);
router.get('/:equbId/contributions', authMiddleware, contributionController.getContributionsByEqub);
router.post('/initiate-payment', authMiddleware, contributionController.initiatePayment);
router.post('/payment/callback', authMiddleware, contributionController.paymentCallback);
router.post('/check-contribution', authMiddleware, contributionController.checkContribution);
router.get('/:userId/contribution-history', authMiddleware, contributionController.getContributionsByUser);
router.delete('/contribution/:id', authMiddleware, contributionController.deleteContribution);

module.exports = router;
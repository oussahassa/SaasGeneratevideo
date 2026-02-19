import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  createStripePayment,
  createPayPalPayment,
  createPaymeePayment,
  handleStripeWebhook,
  handlePayPalWebhook,
  handlePaymeeWebhook,
} from '../controllers/paymentController.js';

const paymentRouter = express.Router();

// Payment creation routes
paymentRouter.post('/stripe/create', auth, createStripePayment);
paymentRouter.post('/paypal/create', auth, createPayPalPayment);
paymentRouter.post('/paymee/create', auth, createPaymeePayment);

// Webhook routes (no auth required)
paymentRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
paymentRouter.post('/paypal/webhook', express.json(), handlePayPalWebhook);
paymentRouter.post('/paymee/webhook', express.json(), handlePaymeeWebhook);

export default paymentRouter;
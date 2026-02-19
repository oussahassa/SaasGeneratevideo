import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import axios from 'axios';
import sql from "../configs/db.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PayPal configuration
const environment =
  process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

const paypalClient = new paypal.core.PayPalHttpClient(environment);

/* =========================
   PAYMEE CONFIG
========================= */

const PAYMEE_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://app.paymee.tn/api/v2/payments/create"
    : "https://sandbox.paymee.tn/api/v2/payments/create";

export const createStripePayment = async (req, res) => {
  try {
    const { packId, amount, currency = 'usd' } = req.body;
    const userId = req.user.id;

    // Get pack details
    const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
    if (pack.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: pack.rows[0].name,
            description: pack.rows[0].description,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: userId.toString(),
        packId: packId.toString(),
      },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
};

export const createPayPalPayment = async (req, res) => {
  try {
    const { packId, amount, currency = 'USD' } = req.body;
    const userId = req.user.id;

    // Get pack details
    const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
    if (pack.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
        description: pack.rows[0].description,
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    });

    const order = await paypalClient.execute(request);

    res.json({
      success: true,
      orderId: order.result.id,
      approvalUrl: order.result.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('PayPal payment error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
};

export const createPaymeePayment = async (req, res) => {
  try {
    const { packId, amount, currency = 'TND' } = req.body;
    const userId = req.user.id;

    // Get pack details
    const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
    if (pack.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const paymentData = {
      vendor: process.env.PAYMEE_VENDOR_KEY,
      amount: amount,
      note: `Payment for ${pack.rows[0].name}`,
      first_name: req.user.firstName,
      last_name: req.user.lastName,
      email: req.user.email,
      phone: req.body.phone || '',
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/payments/paymee/webhook`,
      order_id: `pack_${packId}_user_${userId}_${Date.now()}`,
    };

    const response = await axios.post(PAYMEE_BASE_URL, paymentData, {
      headers: {
        'Authorization': `Token ${process.env.PAYMEE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({
      success: true,
      paymentUrl: response.data.payment_url,
      token: response.data.token,
    });
  } catch (error) {
    console.error('Paymee payment error:', error);
    res.status(500).json({ success: false, message: 'Payment creation failed' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const packId = session.metadata.packId;

    // Update user subscription
    await sql`
      UPDATE users SET pack_id = ${packId}, subscription_status = 'active' WHERE id = ${userId}
    `;
  }

  res.json({ received: true });
};

export const handlePayPalWebhook = async (req, res) => {
  // Handle PayPal webhook events
  const event = req.body;

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    // Process successful payment
    const orderId = event.resource.id;
    // Update subscription based on orderId
  }

  res.json({ received: true });
};

export const handlePaymeeWebhook = async (req, res) => {
  // Handle Paymee webhook
  const { payment_status, order_id } = req.body;

  if (payment_status === 'completed') {
    // Extract packId and userId from order_id
    const [packPart, userPart] = order_id.split('_user_');
    const packId = packPart.replace('pack_', '');
    const userId = userPart.split('_')[0];

    // Update user subscription
    await sql`
      UPDATE users SET pack_id = ${packId}, subscription_status = 'active' WHERE id = ${userId}
    `;
  }

  res.json({ success: true });
};
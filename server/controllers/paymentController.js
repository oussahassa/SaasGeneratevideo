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
    if (pack === null ) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: pack.name,
            description: pack.description,
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
    console.log('Pack details:', pack);
    if (pack === null ) {
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
        description: pack.description,
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
        console.log('Pack details:', pack);

    if (pack === null ) {
      return res.status(404).json({ success: false, message: 'Pack not found' });
    }

    const paymentData = {
      vendor: process.env.PAYMEE_VENDOR_KEY,
      amount: amount,
      checkoutForm:true,
      note: `Payment for ${pack.name}`,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      phone: req.body.phone || '',
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/payments/paymee/webhook`,
      order_id: `pack_${packId}_user_${userId}_${Date.now()}`,
      silentWebhook: true,
      addPaymentFeesToAmount:false
    };
    console.log('Creating Paymee payment with data:', paymentData);

    const response = await axios.post(PAYMEE_BASE_URL, paymentData, {
      headers: {
        'Authorization': `Token ${process.env.PAYMEE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Creating Paymee payment with data:', response.data);

    res.json({
      success: true,
      paymentUrl: response.data.data.payment_url,
      token: response.data.data.token,
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

    try {
      // Get pack details
      const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
      if (!pack || pack.length === 0) {
        console.error('Pack not found:', packId);
        return res.status(404).json({ success: false, message: 'Pack not found' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await sql`
        SELECT * FROM user_subscriptions
        WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()
      `;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      if (existingSubscription && existingSubscription.length > 0) {
        // Update existing subscription
        await sql`
          UPDATE user_subscriptions
          SET pack_id = ${packId}, end_date = ${endDate}, updated_at = NOW()
          WHERE user_id = ${userId} AND is_active = TRUE
        `;
      } else {
        // Create new subscription
        await sql`
          INSERT INTO user_subscriptions (user_id, pack_id, start_date, end_date, is_active, monthly_limit)
          VALUES (${userId}, ${packId}, ${startDate}, ${endDate}, TRUE, ${pack[0].monthly_limit || 0})
        `;
      }

      console.log('Subscription updated/created for user:', userId);
    } catch (error) {
      console.error('Error processing subscription:', error);
    }
  }

  res.json({ received: true });
};

export const handlePayPalWebhook = async (req, res) => {
  // Handle PayPal webhook events
  const event = req.body;

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    try {
      // Extract order details from webhook
      const orderId = event.resource.id;
      const amount = event.resource.amount.value;

      // You would need to store order metadata in a database to retrieve packId and userId
      // For now, this is a placeholder - you should implement proper order tracking
      
      console.log('PayPal payment captured for order:', orderId);
      
      // Example of how to handle this if you have order tracking:
      // const order = await sql`SELECT * FROM orders WHERE paypal_order_id = ${orderId}`;
      // if (order && order.length > 0) {
      //   const userId = order[0].user_id;
      //   const packId = order[0].pack_id;
      //   
      //   const startDate = new Date();
      //   const endDate = new Date();
      //   endDate.setMonth(endDate.getMonth() + 1);
      //   
      //   await sql`
      //     INSERT INTO user_subscriptions (user_id, pack_id, start_date, end_date, is_active, monthly_limit)
      //     VALUES (${userId}, ${packId}, ${startDate}, ${endDate}, TRUE, ...)
      //   `;
      // }
    } catch (error) {
      console.error('Error processing PayPal webhook:', error);
    }
  }

  res.json({ received: true });
};

export const handlePaymeeWebhook = async (req, res) => {
  // Handle Paymee webhook
  const { payment_status, order_id } = req.body;
console.log('Received Paymee webhook:', req.body);
  if (payment_status === 'completed') {
    try {
      // Extract packId and userId from order_id
      // order_id format: pack_${packId}_user_${userId}_${timestamp}
      const parts = order_id.split('_user_');
      if (parts.length !== 2) {
        console.error('Invalid order_id format:', order_id);
        return res.status(400).json({ success: false, message: 'Invalid order format' });
      }

      const packId = parseInt(parts[0].replace('pack_', ''));
      const userIdPart = parts[1].split('_');
      const userId = userIdPart[0];

      // Get pack details
      const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
      if (!pack || pack.length === 0) {
        console.error('Pack not found:', packId);
        return res.status(404).json({ success: false, message: 'Pack not found' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await sql`
        SELECT * FROM user_subscriptions
        WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()
      `;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      if (existingSubscription && existingSubscription.length > 0) {
        // Update existing subscription
        await sql`
          UPDATE user_subscriptions
          SET pack_id = ${packId}, end_date = ${endDate}, updated_at = NOW()
          WHERE user_id = ${userId} AND is_active = TRUE
        `;
      } else {
        // Create new subscription
        await sql`
          INSERT INTO user_subscriptions (user_id, pack_id, start_date, end_date, is_active, monthly_limit)
          VALUES (${userId}, ${packId}, ${startDate}, ${endDate}, TRUE, ${pack[0].monthly_limit || 0})
        `;
      }

      console.log('Paymee subscription updated/created for user:', userId);
    } catch (error) {
      console.error('Error processing Paymee webhook:', error);
    }
  }

  res.json({ success: true });
};
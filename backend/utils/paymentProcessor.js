// utils/paymentProcessor.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processPayment = async (paymentMethod, paymentDetails, amount) => {
  try {
    if (paymentMethod === 'credit-card') {
      // Create a PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // amount in cents
        currency: 'usd',
        payment_method: paymentDetails.paymentMethodId,
        confirm: true,
        description: 'E-commerce purchase',
        return_url: 'https://your-site.com/order-confirmation'
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: paymentDetails.email
        }
      };
    } else if (paymentMethod === 'paypal') {
      // Implement PayPal integration here
      // This would be more complex with actual PayPal API calls
      return {
        success: true,
        paymentResult: {
          id: `paypal_${Date.now()}`,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: paymentDetails.email
        }
      };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Payment processing failed');
  }
};

module.exports = { processPayment };
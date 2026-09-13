import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { UserModel } from '../models/User';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15' as any }) : null;

// POST /stripe/create-checkout-session - Pro Subscription with 7-Day Free Trial
router.post('/create-checkout-session', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || 'member@yurifitness.com';
    const baseUrl = req.headers.origin || 'https://yurifitness.aceddivision.com';

    if (!stripe) {
      // Simulated checkout when live Stripe key is not configured
      if (userId) {
        await UserModel.findByIdAndUpdate(userId, { subscriptionStatus: 'pro' });
      }
      res.json({
        url: `${baseUrl}/profile?upgrade=success&simulated=true`,
        simulated: true,
        message: 'Upgraded to Yuri Pro (Simulated 7-Day Free Trial)'
      });
      return;
    }

    // Real Stripe Checkout Session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userId,
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: userId || '' }
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Yuri Pro — Unlimited AI Fitness',
              description: 'Unlimited AI workout adaptations, injury swaps, and progress analytics. 7 days free, then $12.99/mo.'
            },
            unit_amount: 1299, // $12.99
            recurring: { interval: 'month' }
          },
          quantity: 1
        }
      ],
      success_url: `${baseUrl}/profile?upgrade=success`,
      cancel_url: `${baseUrl}/profile?upgrade=canceled`
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe] Checkout session error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// POST /stripe/customer-portal - Manage billing
router.post('/customer-portal', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const baseUrl = req.headers.origin || 'https://yurifitness.aceddivision.com';

    if (!stripe || !userId) {
      res.json({ url: `${baseUrl}/profile` });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user?.stripeCustomerId) {
      res.json({ url: `${baseUrl}/profile` });
      return;
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/profile`
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stripe/simulate-upgrade - Instant toggle for testing
router.post('/simulate-upgrade', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { targetStatus = 'pro' } = req.body;
    if (userId) {
      await UserModel.findByIdAndUpdate(userId, { subscriptionStatus: targetStatus });
    }
    res.json({ success: true, subscriptionStatus: targetStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stripe/webhook - Webhook listener
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (stripe && webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;

        if (userId) {
          await UserModel.findByIdAndUpdate(userId, {
            subscriptionStatus: 'pro',
            stripeCustomerId: customerId
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await UserModel.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'free' }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook Error]:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;

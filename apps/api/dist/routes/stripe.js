"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import Stripe from 'stripe';
const router = (0, express_1.Router)();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
router.post('/create-checkout-session', async (req, res) => {
    // Stub for now. 
    // We'll just return a fake URL that front-end can simulate with
    res.json({ url: 'http://localhost:5173/profile?simulated_checkout=success' });
});
router.post('/webhook', (req, res) => {
    console.log('Received Stripe Webhook');
    res.json({ received: true });
});
exports.default = router;

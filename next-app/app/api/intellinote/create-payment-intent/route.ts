import { NextRequest, NextResponse } from "next/server";

// const key= process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            setup_future_usage: 'off_session',
        });
        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error("internal error", error);
        return NextResponse.json({ error: `Internal server error: ${error}`}, { status: 500 });
    }
 }

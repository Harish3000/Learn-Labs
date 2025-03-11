"use client";

import CheckoutPage from "../_components/checkout-page";
import convertToSubcurrency from '@/lib/convertToSubcurrency';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Payment() {
    const amount = 49.99;
    return <div className="rounded-2xl border border-indigo-600 p-6 shadow-xs sm:px-8 lg:p-12">
        <h1 className="text-3xl text-center font-bold ">Payment</h1>
        <p className="text-lg mt-2">Total Amount: ${amount}</p>
        <Elements stripe={stripePromise}
            options={{
                mode: "subscription",
                amount: convertToSubcurrency(amount),
                currency: "usd"
            }}
        >
            <CheckoutPage amount={amount} />
        </Elements>
    </div>
}


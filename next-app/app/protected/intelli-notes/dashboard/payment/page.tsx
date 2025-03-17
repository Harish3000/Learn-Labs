"use client";

import { useEffect, useState } from "react";
import CheckoutPage from "../_components/checkout-page";
import convertToSubcurrency from '@/lib/convertToSubcurrency';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Payment() {
    const amount = 19.99;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading effect while Stripe initializes
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="rounded-2xl border border-zinc-500 p-4 shadow-xs sm:px-6 lg:p-10 ml-40">
        <h1 className="text-3xl text-center font-medium">Payment</h1>
        <p className="text-lg mt-2">Total Amount: ${amount}</p>

            {isLoading ? (
                <div className="mt-3 space-y-4 ">
                    <div className="bg-gray-200 rounded-md h-[50px] w-[350px] animate-pulse"></div>
                    <div className="bg-gray-200 rounded-md h-[50px] w-[350px] animate-pulse"></div>
                    <div className="bg-gray-200 rounded-md h-[50px] w-[350px] animate-pulse"></div>
                    <div className="bg-gray-300 rounded-md h-[50px] w-[350px] animate-pulse"></div>
                    <div className="bg-black rounded-md h-[50px] w-[350px] animate-pulse"></div>
                </div>
            ) : (
                    
        <Elements stripe={stripePromise}
            options={{
                mode: "subscription",
                amount: convertToSubcurrency(amount),
                currency: "usd"
            }}
        >
            <CheckoutPage amount={amount} />
                </Elements>
            )}           
    </div>
    );
}


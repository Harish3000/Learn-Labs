"use client";

import { useEffect, useState } from "react";
import CheckoutPage from "../_components/checkout-page";
import convertToSubcurrency from '@/lib/convertToSubcurrency';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-6 rounded-2xl border border-gray-300 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-center font-medium mb-4">Total Amount: <span className="text-indigo-600 font-bold">${amount}</span></p>
                    {isLoading ? (
                        <div className="mt-3 space-y-4 animate-pulse">
                            <div className="bg-gray-200 rounded-md h-12 w-full"></div>
                            <div className="bg-gray-200 rounded-md h-12 w-full"></div>
                            <div className="bg-gray-200 rounded-md h-12 w-full"></div>
                            <div className="bg-gray-300 rounded-md h-12 w-full"></div>
                            <div className="bg-black rounded-md h-12 w-full"></div>
                        </div>
                    ) : (
                        <Elements stripe={stripePromise} options={{
                            mode: "subscription",
                            amount: convertToSubcurrency(amount),
                            currency: "usd"
                        }}>
                            <CheckoutPage amount={amount} />
                        </Elements>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

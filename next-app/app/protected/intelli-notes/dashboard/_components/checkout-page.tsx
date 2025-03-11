"use client"

import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import convertToSubcurrency from '@/lib/convertToSubcurrency';

const CheckoutPage = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/intellinote/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
        })
            .then((response) => response.json())
            .then((data) => {
                setClientSecret(data.clientSecret);
            });

    }, [amount]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        if (!stripe || !elements) {
            return;
        }
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "An unexpected error occurred.");
            setLoading(false);
            return;
        }
    };

    return (
        <form onSubmit={handleSubmit} className='bg-white p-1 rounded-md px-10 '>
            {clientSecret && <PaymentElement />}
            {errorMessage && <div>{errorMessage}</div>}
            <button
                disabled={!stripe || loading}
                className='text-white w-full p-2.5 bg-black mt-1 rounded-md font-bold disabled:opacity-50 disabled:animate-plus'>
                {!loading ? `Pay $${amount}` : "Processing..."}
            </button>
        </form>
    )
};


export default CheckoutPage;

import { CheckCircleIcon } from "lucide-react";

export default function PaymentSuccess({
    searchParams:{amount},
}: {
    searchParams: { amount: string };
}) {
    return (
     
        <main className='max-w-6xl mx-auto p-20 text-black text-center m-10 ml-40 rounded-2xl border border-zinc-500 shadow-xs '>
            <div>
                <h1 className='text-3xl font-medium'>Thank you!</h1>
                <p className='text-xl'>You have successfully sent </p>
                <div className=' bg-slate-700 p-2 rounded-md text-4xl mt-5 font-bold text-white opacity-80'>$ 19.99 </div>
                {/* Animated Green Tick */}
                <div className="flex justify-center mt-10">
                    <CheckCircleIcon className="text-green-500 w-20 h-20 animate-ping" />
                </div>
            </div>
        </main>
    )
 }

// // "use client";

// // import {
// //   GoogleGenerativeAI,
// //   HarmCategory,
// //   HarmBlockThreshold,
// // } from "@google/generative-ai";
// // import { useState } from "react";

// // const MODEL_NAME = "gemini-1.0-pro";
// // const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

// // export default function Home() {
// //   const [data, setData] = useState<string>("");

// //   async function runChat(prompt: string) {
// //     const genAI = new GoogleGenerativeAI(API_KEY);
// //     const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// //     const generationConfig = {
// //       temperature: 0.9,
// //       topK: 1,
// //       topP: 1,
// //       maxOutputTokens: 2048,
// //     };

// //     const safetySettings = [
// //       {
// //         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
// //         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
// //       },
// //       {
// //         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
// //         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
// //       },
// //       {
// //         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
// //         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
// //       },
// //       {
// //         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
// //         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
// //       },
// //     ];

// //     const chat = model.startChat({
// //       generationConfig,
// //       safetySettings,
// //       history: [
// //         {
// //           role: "user",
// //           parts: [{ text: "HELLO" }],
// //         },
// //         {
// //           role: "model",
// //           parts: [{ text: "Hello there! How can I assist you today?" }],
// //         },
// //       ],
// //     });

// //     const result = await chat.sendMessage(prompt);
// //     const response = result.response;
// //     setData(response.text());
// //   }

// //   const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
// //     event.preventDefault();
// //     const prompt = (event.target as HTMLFormElement)?.prompt?.value || "";
// //     runChat(prompt);
// //   };

// //   return (
// //     <main className="flex min-h-screen flex-col items-center p-24">
// //       <form onSubmit={onSubmit} className="">
// //         <p className="mb-2">Enter your summary here</p>
// //         <input
// //           type="text"
// //           placeholder="Enter your summary here"
// //           name="prompt"
// //           className="border-none outline-none p-4 rounded-lg text-black"
// //         />{" "}
// //         <br />
// //         <button
// //           type="submit"
// //           className="bg-white border border-none outline-none p-4 rounded-lg text-black font-bold uppercase mt-2"
// //         >
// //           Submit
// //         </button>
// //       </form>
// //       {data && (
// //         <div>
// //           <h1 className="mt-32">Output</h1>
// //           <div dangerouslySetInnerHTML={{ __html: data }} />
// //         </div>
// //       )}
// //     </main>
// //   );
// // }

// "use client";

// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } from "@google/generative-ai";
// import { useState } from "react";

// const MODEL_NAME = "gemini-1.0-pro";
// const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

// export default function Home() {
//   const [summary, setSummary] = useState("");
//   const [responseData, setResponseData] = useState<string>("");

//   // Function to handle input changes
//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSummary(event.target.value);
//   };

//   // Function to store the summary in the database
//   const storeSummaryInDatabase = async (
//     userId: string,
//     email: string,
//     firstname: string,
//     summary: string
//   ) => {
//     try {
//       const response = await fetch("/api/colab-summary/summary", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ userId, email, firstname, summary }),
//       });

//       if (!response.ok) {
//         console.error("Failed to store summary in database");
//         alert("Failed to submit summary");
//       } else {
//         alert("Summary submitted successfully!");
//         setSummary(""); // Clear the input after submission
//       }
//     } catch (error) {
//       console.error("Error storing summary:", error);
//       alert("Error submitting summary");
//     }
//   };

//   // Function to call the Gemini API
//   const runChat = async (prompt: string) => {
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });

//     const generationConfig = {
//       temperature: 0.9,
//       topK: 1,
//       topP: 1,
//       maxOutputTokens: 2048,
//     };

//     const safetySettings = [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//     ];

//     const formattedPrompt = `Do a fact-checking and give me a summarization for the given text (include the fact-ckecking in first two points, in the next point provide the summary. in the next point give me the accuracy of the provided text as a percentage): ${prompt}`;

//     const chat = model.startChat({
//       generationConfig,
//       safetySettings,
//       history: [
//         {
//           role: "user",
//           parts: [{ text: "ormattedPrompt" }],
//         }
//       ],
//     });

//     const result = await chat.sendMessage(formattedPrompt);
//     const response = result.response;
//     setResponseData(response.text());
//   };

//   // Function to handle form submission
//   const handleSubmit = async () => {
//     // Retrieve the current logged-in user details from local storage
//     const user = localStorage.getItem("user");
//     if (!user) {
//       alert("User not found. Please log in.");
//       return;
//     }

//     const parsedUser = JSON.parse(user);
//     const { _id, email, firstname } = parsedUser.user;

//     // Store the summary in the database
//     await storeSummaryInDatabase(_id, email, firstname, summary);

//     // Send the response to Gemini API
//     await runChat(summary);
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
//       <h1 className="text-3xl font-semibold text-gray-800 mb-4">Submit your summary here</h1>

//       <div className="flex flex-col items-center w-full max-w-md mx-auto">
//         <input
//           type="text"
//           value={summary}
//           onChange={handleInputChange}
//           placeholder="Enter your summary"
//           className="p-4 border rounded-lg w-full text-black bg-white mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <button
//           onClick={handleSubmit}
//           className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
//         >
//           Submit
//         </button>
//       </div>

//       {responseData && (
//         <div className="mt-8 w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Report</h2>
//           <div className="text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: responseData }} />
//         </div>
//       )}
//     </main>
//   );
// }


// factChecking, summaryText, accuracyText

"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useState } from "react";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

export default function Home() {
  const [summary, setSummary] = useState("");
  const [responseData, setResponseData] = useState<string>("");

  // Function to handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
  };

  // Function to store the summary in the database
  const storeSummaryInDatabase = async (
    userId: string,
    email: string,
    firstname: string,
    fact_checking: string,
    gemini_summary: string,
    accuracy: number
  ) => {
    try {
      const response = await fetch("/api/colab-summary/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          firstname,
          fact_checking,
          gemini_summary,
          accuracy,
        }),
      });

      if (!response.ok) {
        console.error("Failed to store summary in database");
        alert("Failed to submit summary");
      } else {
        alert("Summary submitted successfully!");
        setSummary(""); // Clear the input after submission
      }
    } catch (error) {
      console.error("Error storing summary:", error);
      alert("Error submitting summary");
    }
  };

  // Function to call the Gemini API
  const runChat = async (prompt: string) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const formattedPrompt = `Do a fact-checking and give me a summarization for the given text (include the fact-ckecking in first point, in the next point provide the summary. in the next point give me the accuracy of the provided text as a percentage) seperated as : factChecking, summaryText, accuracyText : ${prompt}`;

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: formattedPrompt }],
        },
      ],
    });

    const result = await chat.sendMessage(formattedPrompt);
    const response = result.response;
    const responseText = response.text();

    setResponseData(responseText);

    // Extracting fact-checking, summary, and accuracy from the response
    const [factChecking, summaryText, accuracyText] = responseText.split("\n");

    // Parsing accuracy from the response (assumes it's in a percentage format like "Accuracy: 85%")
    const accuracyMatch = accuracyText.match(/Accuracy: (\d+)%/);
    const accuracy = accuracyMatch ? parseInt(accuracyMatch[1], 10) : 0;

    // Retrieve user details from local storage
    const user = localStorage.getItem("user");
    if (!user) {
      alert("User not found. Please log in.");
      return;
    }

    const parsedUser = JSON.parse(user);
    const { _id, email, firstname } = parsedUser.user;

    // Store the fact-checking, summary, and accuracy in the database
    await storeSummaryInDatabase(_id, email, firstname, factChecking, summaryText, accuracy);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Send the response to Gemini API
    await runChat(summary);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Submit your summary here</h1>

      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <input
          type="text"
          value={summary}
          onChange={handleInputChange}
          placeholder="Enter your summary"
          className="p-4 border rounded-lg w-full text-black bg-white mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSubmit}
          className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
        >
          Submit
        </button>
      </div>

      {responseData && (
        <div className="mt-8 w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Report</h2>
          <div className="text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: responseData }} />
        </div>
      )}
    </main>
  );
}

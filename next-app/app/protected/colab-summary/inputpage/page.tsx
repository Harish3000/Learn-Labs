"use client";

import React, { useState } from "react";

export default function End() {
  const [summary, setSummary] = useState("");

  // Function to handle the input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Retrieve the current logged-in user details from local storage
    const user = localStorage.getItem("user");
    if (!user) {
      alert("User not found. Please log in.");
      return;
    }

    const parsedUser = JSON.parse(user);
    const { _id, email, firstname } = parsedUser.user;
    const dataToSend = {
      userId: _id,
      email,
      firstname,
      summary,
    };

    // Send data to your backend API endpoint
    const storeSummaryInDatabase = async (userId: string, email: string, firstname: string, summary: string) => {
      try {
        const response = await fetch("/api/colab-summary/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, email, firstname, summary }),
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

    storeSummaryInDatabase(dataToSend.userId, dataToSend.email, dataToSend.firstname, dataToSend.summary);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Stack elements vertically
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h1>Submit your summary here</h1>
      <input
        type="text"
        value={summary}
        onChange={handleInputChange}
        placeholder="Enter your summary"
        style={{ marginTop: "10px", padding: "8px", width: "300px" }}
      />
      <button
        onClick={handleSubmit} // Attach click handler
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Submit
      </button>
    </div>
  );
}

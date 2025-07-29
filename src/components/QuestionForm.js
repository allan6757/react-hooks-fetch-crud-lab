// src/components/QuestionForm.js
import React, { useState } from "react";

function QuestionForm({ onAddQuestion }) {
  const [formData, setFormData] = useState({
    prompt: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    correctIndex: "0", // Default to first answer
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { prompt, answer1, answer2, answer3, answer4, correctIndex } = formData;
    const answers = [answer1, answer2, answer3, answer4].filter(Boolean); // Filter out empty answers
    const newQuestion = {
      prompt,
      answers,
      correct_answer: answers[parseInt(correctIndex, 10)], // Convert index back to string answer for API
    };

    fetch("http://localhost:4000/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newQuestion),
    })
      .then((r) => r.json())
      .then((data) => {
        onAddQuestion(data);
        setFormData({
          prompt: "",
          answer1: "",
          answer2: "",
          answer3: "",
          answer4: "",
          correctIndex: "0",
        });
      })
      .catch((error) => console.error("Error adding question:", error));
  };

  return (
    <section className="question-form bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">New Question</h2>
      {/* ADD aria-label HERE */}
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="New Question Form">
        <label className="block">
          <span className="text-gray-700 font-medium">Prompt:</span>
          <input
            type="text"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </label>
        {/* Answer inputs */}
        {[1, 2, 3, 4].map((num) => (
          <label key={num} className="block">
            <span className="text-gray-700 font-medium">Answer {num}:</span>
            <input
              type="text"
              name={`answer${num}`}
              value={formData[`answer${num}`]}
              onChange={handleChange}
              required={num <= 2} // Require at least two answers
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </label>
        ))}

        <label className="block">
          <span className="text-gray-700 font-medium">Correct Answer:</span>
          <select
            name="correctIndex"
            value={formData.correctIndex}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {/* Map over answers only if they exist, or provide default 4 options */}
            {/* This part in QuestionForm is tricky as answers are not fully formed until submission */}
            {/* For simplicity in the form, you might just have fixed "Answer 1", "Answer 2" options */}
            {/* or dynamically generate based on answers that have content */}
            {/* Assuming basic structure from the test's perspective */}
            <option value="0">Answer 1</option>
            <option value="1">Answer 2</option>
            <option value="2">Answer 3</option>
            <option value="3">Answer 4</option>
          </select>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out cursor-pointer font-semibold"
        >
          Add Question
        </button>
      </form>
    </section>
  );
}

export default QuestionForm;

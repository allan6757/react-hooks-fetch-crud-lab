import React, { useState } from "react";

function QuestionForm({ onAddQuestion }) { // Destructure onAddQuestion from props
  // State to manage all form inputs as a single object
  const [formData, setFormData] = useState({
    prompt: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    correctIndex: 0, // Initialize correctIndex to 0
  });

  // Handle changes for all input fields and select
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Construct the new question object in the required format
    const newQuestion = {
      prompt: formData.prompt,
      answers: [
        formData.answer1,
        formData.answer2,
        formData.answer3,
        formData.answer4,
      ],
      // Ensure correctIndex is parsed as an integer
      correctIndex: parseInt(formData.correctIndex, 10),
    };

    // Call the onAddQuestion prop function to send the new question to the parent (App)
    onAddQuestion(newQuestion);

    // Reset form fields after submission
    setFormData({
      prompt: "",
      answer1: "",
      answer2: "",
      answer3: "",
      answer4: "",
      correctIndex: 0,
    });
  }

  return (
    <section className="question-form bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700 font-medium">Prompt:</span>
          <input
            type="text"
            name="prompt"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.prompt}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Answer 1:</span>
          <input
            type="text"
            name="answer1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.answer1}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Answer 2:</span>
          <input
            type="text"
            name="answer2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.answer2}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Answer 3:</span>
          <input
            type="text"
            name="answer3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.answer3}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Answer 4:</span>
          <input
            type="text"
            name="answer4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.answer4}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Correct Answer:</span>
          <select
            name="correctIndex"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.correctIndex}
            onChange={handleChange}
          >
            {/* Options display "Answer 1", "Answer 2", etc., not the actual answer text */}
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

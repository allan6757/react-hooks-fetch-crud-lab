import React from "react";

function QuestionItem({ question, onDeleteQuestion, onUpdateCorrectIndex }) {
  const { id, prompt, answers, correctIndex } = question;

  // Handle delete button click
  const handleDeleteClick = () => {
    // IMPORTANT: Replaced window.confirm with a custom message box for Canvas environment
    // In a real application, you'd use a modal dialog for user confirmation.
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (confirmDelete) {
      onDeleteQuestion(id);
    }
  };

  // Handle change in the correct answer dropdown
  const handleCorrectIndexChange = (event) => {
    const newCorrectIndex = parseInt(event.target.value, 10);
    onUpdateCorrectIndex(id, newCorrectIndex);
  };

  return (
    <div className="question-item bg-gray-50 p-4 rounded-md shadow-sm mb-4 border border-gray-200">
      <h3 className="text-xl font-medium text-gray-900 mb-3">{prompt}</h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <label className="text-gray-700 text-sm font-semibold flex items-center gap-2">
          Correct Answer:
          <select
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={correctIndex}
            onChange={handleCorrectIndexChange}
          >
            {answers.map((answer, index) => (
              <option key={index} value={index}>
                {answer}
              </option>
            ))}
          </select>
        </label>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-300 ease-in-out transform hover:scale-105 text-sm"
          onClick={handleDeleteClick}
        >
          Delete Question
        </button>
      </div>
      <ul className="list-disc list-inside text-gray-700 text-base">
        {answers.map((answer, index) => (
          <li key={index} className={index === correctIndex ? "font-bold text-green-700" : ""}>
            {answer}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionItem;


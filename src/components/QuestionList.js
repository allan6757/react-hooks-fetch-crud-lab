import React from "react";
import QuestionItem from "./QuestionItem"; // Assuming this component exists and is correctly implemented

// QuestionList component receives questions array and handler functions as props
function QuestionList({ questions, onDeleteQuestion, onUpdateCorrectIndex }) {
  return (
    <section className="question-list bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Quiz Questions</h2>
      {/* Conditionally display message if no questions are available */}
      {questions.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No questions available. Add a new question!</p>
      ) : (
        // Display QuestionItem components here after fetching
        <ul className="space-y-4"> {/* Added ul and spacing for list items */}
          {questions.map((question) => (
            <li key={question.id}> {/* Wrap QuestionItem in an li for proper list structure */}
              <QuestionItem
                question={question} // Pass the individual question object
                onDeleteQuestion={onDeleteQuestion} // Pass the delete handler down
                onUpdateCorrectIndex={onUpdateCorrectIndex} // Pass the update handler down
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default QuestionList;


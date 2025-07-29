// src/components/App.js
import React, { useState, useEffect } from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm"; // Correct import

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:4000/questions")
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) {
          // Transform data for QuestionItem: calculate correctIndex from correct_answer
          const transformedQuestions = data.map(q => ({
            ...q,
            correctIndex: q.answers.indexOf(q.correct_answer) // Find index of the correct answer string
          }));
          setQuestions(transformedQuestions);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleAddQuestion(newQuestion) {
    // When adding, ensure newQuestion also has correctIndex derived from correct_answer
    const questionWithIndex = {
      ...newQuestion,
      correctIndex: newQuestion.answers.indexOf(newQuestion.correct_answer)
    };
    setQuestions((prevQuestions) => [...prevQuestions, questionWithIndex]);
  }

  function handleDeleteQuestion(id) {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.ok) {
          setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
        } else {
          console.error("Failed to delete question:", r.status);
        }
      })
      .catch((error) => console.error("Error deleting question:", error));
  }

  // Renamed to be explicit as it receives correctIndex
  function handleUpdateCorrectIndex(id, newCorrectIndex) {
    // Find the question to get its answers array
    const questionToUpdate = questions.find(q => q.id === id);
    if (!questionToUpdate) return;

    // Get the actual answer string from the answers array using the newCorrectIndex
    const updatedCorrectAnswerString = questionToUpdate.answers[newCorrectIndex];

    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      // Send the correct_answer string to the backend
      body: JSON.stringify({ correct_answer: updatedCorrectAnswerString }),
    })
      .then((r) => r.json())
      .then((updatedQuestion) => {
        // Transform the updatedQuestion from API to include correctIndex for client state
        const questionWithIndex = {
          ...updatedQuestion,
          correctIndex: updatedQuestion.answers.indexOf(updatedQuestion.correct_answer)
        };
        setQuestions((currentQuestions) =>
          currentQuestions.map((q) => (q.id === id ? questionWithIndex : q))
        );
      })
      .catch((error) => console.error("Error updating question:", error));
  }

  const handleToggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  return (
    <main>
      <QuestionForm onAddQuestion={handleAddQuestion} />
      <button
        onClick={handleToggleQuestions}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        {showQuestions ? "Hide Questions" : "View Questions"}
      </button>

      {showQuestions && (
        loading ? (
          <p className="text-center text-gray-600 mt-4">Loading questions...</p>
        ) : (
          <QuestionList
            questions={questions}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateCorrectIndex={handleUpdateCorrectIndex} // Corrected prop name
          />
        )
      )}
    </main>
  );
}

export default App;
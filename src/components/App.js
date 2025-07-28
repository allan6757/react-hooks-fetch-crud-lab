import React, { useState, useEffect } from "react";
import AdminNavBar from "./AdminNavBar"; // Assuming this component exists
import QuestionForm from "./QuestionForm"; // Assuming this component exists
import QuestionList from "./QuestionList"; // Assuming this component exists

function App() {
  // State to control which view is shown: "List" for questions list, "Form" for new question form
  const [page, setPage] = useState("List");
  // State to store the list of questions fetched from the API
  const [questions, setQuestions] = useState([]);
  // State for loading status (optional but good practice for UX)
  const [loading, setLoading] = useState(true);
  // State for error handling during API calls (optional but good practice)
  const [error, setError] = useState(null);

  // useEffect hook to fetch questions from the API when the component mounts
  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetch("http://localhost:4000/questions")
      .then((response) => {
        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => {
        setQuestions(data); // Update the questions state with fetched data
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError(err); // Set error state if fetching fails
        setLoading(false); // Set loading to false even if there's an error
        console.error("Error fetching questions:", err); // Log the error to console
      });
  }, []); // Empty dependency array means this effect runs only once on component mount

  // Function to handle adding a new question to the API (POST request)
  const handleAddQuestion = (newQuestion) => {
    fetch("http://localhost:4000/questions", {
      method: "POST", // Specify POST method
      headers: {
        "Content-Type": "application/json", // Required header for JSON body
      },
      body: JSON.stringify(newQuestion), // Convert new question object to JSON string
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the response from the server (usually the added item)
      })
      .then((addedQuestion) => {
        // Update the questions state by adding the newly created question
        setQuestions([...questions, addedQuestion]);
        setPage("List"); // Navigate back to the list view after adding
      })
      .catch((err) => {
        setError(err);
        console.error("Error adding question:", err);
      });
  };

  // Function to handle deleting a question from the API (DELETE request)
  const handleDeleteQuestion = (id) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE", // Specify DELETE method
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Filter out the deleted question from the state
        setQuestions(questions.filter((q) => q.id !== id));
      })
      .catch((err) => {
        setError(err);
        console.error("Error deleting question:", err);
      });
  };

  // Function to handle updating a question's correctIndex (PATCH request)
  const handleUpdateCorrectIndex = (id, correctIndex) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH", // Specify PATCH method
      headers: {
        "Content-Type": "application/json", // Required header for JSON body
      },
      body: JSON.stringify({ correctIndex }), // Only send the correctIndex to update
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the response (usually the updated item)
      })
      .then((updatedQuestion) => {
        // Update the specific question in the state array
        setQuestions(
          questions.map((q) => (q.id === id ? updatedQuestion : q))
        );
      })
      .catch((err) => {
        setError(err);
        console.error("Error updating question:", err);
      });
  };

  // Display loading message while data is being fetched
  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto text-center text-gray-600 text-lg mt-8">
        Loading questions...
      </main>
    );
  }

  // Display error message if fetching fails
  if (error) {
    return (
      <main className="p-6 max-w-3xl mx-auto text-center text-red-600 text-lg mt-8">
        Error: {error.message}
      </main>
    );
  }

  return (
    <main className="App p-6 max-w-3xl mx-auto bg-gray-100 rounded-lg shadow-xl my-8 font-sans">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Quiz Master Admin</h1>
      {/* AdminNavBar controls the 'page' state */}
      <AdminNavBar onChangePage={setPage} />

      {/* Conditionally render QuestionForm or QuestionList based on 'page' state */}
      {page === "Form" ? (
        <QuestionForm onAddQuestion={handleAddQuestion} />
      ) : (
        <QuestionList
          questions={questions} // Pass the questions data
          onDeleteQuestion={handleDeleteQuestion} // Pass the delete handler
          onUpdateCorrectIndex={handleUpdateCorrectIndex} // Pass the update handler
        />
      )}
    </main>
  );
}

export default App;


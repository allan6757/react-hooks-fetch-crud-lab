import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react-dom/test-utils"; // Import act
import App from "../components/App";

// Mock the global fetch function
global.fetch = jest.fn();

// Mock initial questions data with correctIndex for client-side use
const mockQuestions = [
  {
    id: 1,
    prompt: "lorem testum 1",
    answers: ["a", "b", "c", "d"],
    correct_answer: "a", // Backend expects this
    correctIndex: 0, // Frontend will use this
  },
  {
    id: 2,
    prompt: "lorem testum 2",
    answers: ["e", "f", "g", "h"],
    correct_answer: "e", // Backend expects this
    correctIndex: 0, // Frontend will use this
  },
];

// Mock window.confirm since JSDOM doesn't implement it
const originalConfirm = window.confirm;
beforeAll(() => {
  window.confirm = jest.fn(() => true); // Default to "confirm" (return true)
});

afterAll(() => {
  window.confirm = originalConfirm; // Restore original after all tests
});

beforeEach(() => {
  // Clear fetch mock before each test
  fetch.mockClear();
  // Reset window.confirm mock before each test to control its behavior per test
  window.confirm.mockClear();
  window.confirm.mockReturnValue(true); // Default to confirming
});

describe("App component", () => {
  test("displays question prompts after fetching", async () => {
    // Mock the successful fetch response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    );

    // Wrap initial render in act to handle the useEffect's state update
    await act(async () => {
      render(<App />);
    });

    // Click the "View Questions" button to make the list visible
    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    // Use findByText to wait for the questions to appear after fetch and toggle
    expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
  });

  test("creates a new question when the form is submitted", async () => {
    // Mock the initial fetch for App component mounting
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // Start with no questions
      })
    );

    // Mock the POST request for adding a new question
    fetch.mockImplementationOnce((url, options) => {
      if (options.method === "POST" && url === "http://localhost:4000/questions") {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 3,
              prompt: body.prompt,
              answers: body.answers,
              correct_answer: body.correct_answer,
            }),
        });
      }
      return Promise.reject(new Error("unmocked fetch in POST test"));
    });

    // Wrap initial render in act
    await act(async () => {
      render(<App />);
    });

    // Get elements using their labels or roles
    const promptInput = screen.getByLabelText(/Prompt:/i);
    const answer1Input = screen.getByLabelText(/Answer 1:/i);
    const answer2Input = screen.getByLabelText(/Answer 2:/i);
    const correctAnswerSelect = screen.getByLabelText(/Correct Answer:/i); // It's a select, so combobox role is not applicable here
    const form = screen.getByRole("form", { name: /New Question Form/i }); // Updated name based on aria-label
    const addQuestionButton = screen.getByRole("button", { name: /Add Question/i });

    // Simulate user input
    fireEvent.change(promptInput, { target: { value: "New Test Question" } });
    fireEvent.change(answer1Input, { target: { value: "yes" } });
    fireEvent.change(answer2Input, { target: { value: "no" } });
    fireEvent.change(correctAnswerSelect, { target: { value: "0" } }); // Select "Answer 1" (index 0)

    // Submit the form, wrapped in act because it causes state updates (fetch + setQuestions)
    await act(async () => {
      fireEvent.submit(form);
    });

    // Toggle questions view if it's not already visible to check the new question
    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton); // Ensures QuestionList is rendered

    // Assert that the new question is displayed after being added
    expect(await screen.findByText(/New Test Question/i)).toBeInTheDocument();
  });

  test("deletes the question when the delete button is clicked", async () => {
    // Mock initial fetch with questions
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    );
    // Mock delete request
    fetch.mockImplementationOnce((url, options) => {
      if (options.method === "DELETE" && url === "http://localhost:4000/questions/1") {
        return Promise.resolve({ ok: true, status: 204 }); // 204 No Content for successful deletion
      }
      return Promise.reject(new Error("unmocked fetch in DELETE test"));
    });

    // Wrap initial render in act
    await act(async () => {
      render(<App />);
    });

    // Click "View Questions" button
    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    // Wait for questions to load and be visible
    const question1Prompt = await screen.findByText(/lorem testum 1/i);
    expect(question1Prompt).toBeInTheDocument(); // Ensure it's there before attempting to delete

    // Find the delete button associated with "lorem testum 1"
    // Use within and getByRole for better accessibility-driven queries
    const questionItem1 = question1Prompt.closest(".question-item");
    const deleteButton = within(questionItem1).getByRole("button", { name: /Delete Question/i });

    // Explicitly set window.confirm to return true for this specific action
    window.confirm.mockReturnValueOnce(true);

    // Click the delete button, wrapped in act
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Assert that the question is no longer in the document
    // Use queryByText and waitFor for elements that should disappear
    await waitFor(() => {
      expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
    });
    // Verify window.confirm was called
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this question?");
  });

  test("updates the answer when the dropdown is changed", async () => {
    // Mock initial fetch with questions
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    );

    // Mock PATCH request for updating answer
    // Simulate updating correct_answer for question with id 2 to 'h'
    fetch.mockImplementationOnce((url, options) => {
      if (options.method === "PATCH" && url === "http://localhost:4000/questions/2") {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockQuestions[1], // Start with original data for question 2
            correct_answer: body.correct_answer, // Update with the correct_answer sent in body
          }),
        });
      }
      return Promise.reject(new Error("unmocked fetch in PATCH test"));
    });

    // Wrap initial render in act
    await act(async () => {
      render(<App />);
    });

    // Click "View Questions" button
    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    // Wait for questions to load
    const question2Prompt = await screen.findByText(/lorem testum 2/i);
    expect(question2Prompt).toBeInTheDocument();

    // Find the select element for "lorem testum 2"
    const questionItem2 = question2Prompt.closest(".question-item");
    // Get the select by its label text within the specific question item
    const selectElement = within(questionItem2).getByLabelText(/Correct Answer:/i);

    // The answers for lorem testum 2 are ["e", "f", "g", "h"].
    // If we want to change to "h", its index is 3.
    // The select options have values as "0", "1", "2", "3".
    const newCorrectIndexValue = "3"; // This corresponds to 'h'

    // fireEvent.change wrapped in act as it triggers state update
    await act(async () => {
      fireEvent.change(selectElement, { target: { value: newCorrectIndexValue } });
    });

    // Assert that the correct answer is visually updated (e.g., has the bold/green class)
    // First, ensure the updated question item re-renders with the new correct answer
    // The previous state for q2 had correctIndex: 0 (answer 'e')
    // Now it should have correctIndex: 3 (answer 'h')
    await waitFor(() => {
      // Find the specific answer 'h' within the question item
      const updatedAnswerH = within(questionItem2).getByText('h');
      expect(updatedAnswerH).toHaveClass('font-bold'); // Check for the bold class
      expect(updatedAnswerH).toHaveClass('text-green-700'); // Check for the green text class

      // Also, assert that the old correct answer 'e' is no longer highlighted
      const oldCorrectAnswerE = within(questionItem2).getByText('e');
      expect(oldCorrectAnswerE).not.toHaveClass('font-bold');
      expect(oldCorrectAnswerE).not.toHaveClass('text-green-700');
    });

    // Also verify the fetch call payload for the PATCH request
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:4000/questions/${mockQuestions[1].id}`, // URL for updating question 2 (id=2)
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correct_answer: "h" }), // Expecting the string 'h'
      })
    );
  });
});
// src/__tests__/App.test.js

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import App from "../components/App";

// Mock initial questions data (ensure this is correct if App.js expects correct_answer or correctIndex)
const mockQuestions = [
  {
    id: 1,
    prompt: "lorem testum 1",
    answers: ["a", "b", "c", "d"],
    correct_answer: "a", // Backend expects this
    correctIndex: 0,     // Frontend uses this
  },
  {
    id: 2,
    prompt: "lorem testum 2",
    answers: ["e", "f", "g", "h"],
    correct_answer: "e", // Backend expects this
    correctIndex: 0,     // Frontend uses this
  },
];

// Store original window.confirm to restore it later
const originalConfirm = window.confirm;

beforeAll(() => {
  // Mock window.confirm once before all tests in this file
  window.confirm = jest.fn(() => true);
});

afterAll(() => {
  // Restore original window.confirm after all tests are done
  window.confirm = originalConfirm;
});

// --- CRITICAL CHANGE HERE ---
beforeEach(() => {
  // Always set global.fetch to a new Jest mock function before each test.
  // This ensures it's always a mock and clears any previous implementations/calls.
  global.fetch = jest.fn();

  // Also clear window.confirm calls and reset its return value for each test
  window.confirm.mockClear();
  window.confirm.mockReturnValue(true);
});
// --- END CRITICAL CHANGE ---

describe("App component", () => {
  test("displays question prompts after fetching", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    );

    await act(async () => {
      render(<App />);
    });

    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    expect(await screen.findByText(/lorem testum 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/lorem testum 2/i)).toBeInTheDocument();
  });

  test("creates a new question when the form is submitted", async () => {
    // Mock initial fetch for App component mounting (e.g., no existing questions)
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
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

    await act(async () => {
      render(<App />);
    });

    const promptInput = screen.getByLabelText(/Prompt:/i);
    const answer1Input = screen.getByLabelText(/Answer 1:/i);
    const answer2Input = screen.getByLabelText(/Answer 2:/i);
    const correctAnswerSelect = screen.getByLabelText(/Correct Answer:/i);
    const form = screen.getByRole("form", { name: /New Question Form/i });

    fireEvent.change(promptInput, { target: { value: "New Test Question" } });
    fireEvent.change(answer1Input, { target: { value: "yes" } });
    fireEvent.change(answer2Input, { target: { value: "no" } });
    fireEvent.change(correctAnswerSelect, { target: { value: "0" } }); // Select "Answer 1" (index 0)

    await act(async () => {
      fireEvent.submit(form);
    });

    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

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
        return Promise.resolve({ ok: true, status: 204 });
      }
      return Promise.reject(new Error("unmocked fetch in DELETE test"));
    });

    await act(async () => {
      render(<App />);
    });

    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    const question1Prompt = await screen.findByText(/lorem testum 1/i);
    expect(question1Prompt).toBeInTheDocument();

    const questionItem1 = question1Prompt.closest(".question-item");
    const deleteButton = within(questionItem1).getByRole("button", { name: /Delete Question/i });

    window.confirm.mockReturnValueOnce(true);

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/lorem testum 1/i)).not.toBeInTheDocument();
    });
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
    fetch.mockImplementationOnce((url, options) => {
      if (options.method === "PATCH" && url === "http://localhost:4000/questions/2") {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockQuestions[1],
            correct_answer: body.correct_answer,
          }),
        });
      }
      return Promise.reject(new Error("unmocked fetch in PATCH test"));
    });

    await act(async () => {
      render(<App />);
    });

    const viewQuestionsButton = screen.getByText(/View Questions/i);
    fireEvent.click(viewQuestionsButton);

    const question2Prompt = await screen.findByText(/lorem testum 2/i);
    expect(question2Prompt).toBeInTheDocument();

    const questionItem2 = question2Prompt.closest(".question-item");
    const selectElement = within(questionItem2).getByLabelText(/Correct Answer:/i);

    const newCorrectIndexValue = "3"; // This corresponds to 'h'

    await act(async () => {
      fireEvent.change(selectElement, { target: { value: newCorrectIndexValue } });
    });

    await waitFor(() => {
        const answersList = within(questionItem2).getByRole('list');

        const updatedAnswerH = within(answersList).getByText('h');
        expect(updatedAnswerH).toHaveClass('font-bold');
        expect(updatedAnswerH).toHaveClass('text-green-700');

        const oldCorrectAnswerE = within(answersList).getByText('e');
        expect(oldCorrectAnswerE).not.toHaveClass('font-bold');
        expect(oldCorrectAnswerE).not.toHaveClass('text-green-700');
    });

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:4000/questions/${mockQuestions[1].id}`,
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correct_answer: "h" }),
      })
    );
  });
});
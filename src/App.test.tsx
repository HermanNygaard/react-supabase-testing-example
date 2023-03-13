import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import App from "./App";
import { expect, afterEach } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);

// The same URL is used when we create our Supabase createClient in App.jsx,
// which makes us intercept the right URL in MSW
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Mock todos rows response
const todos = [{ id: 1, name: "Do laundry" }];

const server = setupServer(
  rest.all(`${SUPABASE_URL}/rest/v1/todos`, async (req, res, ctx) => {
    switch (req.method) {
      case "GET":
        return res(ctx.json(todos));
      case "POST":
        const newTodo = await req.json();
        todos.push({ ...newTodo, id: 2 });
      default:
        return res(ctx.json("Unhandled method"));
    }
  })
);

// Move this to a `setupFiles`
// once you have multiple test files
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays todos", async () => {
  render(<App />);
  await waitForElementToBeRemoved(screen.queryByText("Loading..."));
  expect(await screen.findByText(todos[0].name)).toBeInTheDocument();
});

test("adds a new todo", async () => {
  const newTodoName = "Buy groceries";
  render(<App />);
  const todoNameInput = screen.getByLabelText("Todo name");
  const addTodoButton = screen.getByRole("button");
  fireEvent.change(todoNameInput, { target: { value: newTodoName } });
  fireEvent.click(addTodoButton);
  expect(await screen.findByText(newTodoName)).toBeInTheDocument();
});

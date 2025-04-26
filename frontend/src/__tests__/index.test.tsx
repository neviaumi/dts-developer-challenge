import { routeTree } from "../routeTree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock fetch API
const originalFetch = globalThis.fetch;

function renderRouter() {
  const router = createRouter({
    defaultPendingMinMs: 0,
    routeTree,
  });
  render(<RouterProvider router={router}></RouterProvider>);
  return {
    router,
  };
}

describe("Task Management", () => {
  // Sample task data for testing
  const mockTasks = [
    {
      id: "1",
      title: "Test Task 1",
      description: "Description 1",
      status: "pending",
      due_date: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Test Task 2",
      description: "Description 2",
      status: "completed",
      due_date: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    // Mock fetch for GET /tasks
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url === "http://localhost:8000/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve({ tasks: mockTasks }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
      });
    });

    // Mock window.confirm to always return true
    globalThis.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("should render the task list", async () => {
    renderRouter();

    // Check if the Create Task button is rendered
    await expect(screen.findByText("Create Task")).resolves.toBeInTheDocument();

    // Check if tasks are rendered
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });
  });

  it("should handle task deletion", async () => {
    // Mock fetch for DELETE request
    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      if (url.includes("/tasks/") && options?.method === "DELETE") {
        return Promise.resolve({
          status: 204,
        });
      }
      if (url === "http://localhost:8000/tasks") {
        return Promise.resolve({
          json: () => Promise.resolve({ tasks: mockTasks }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({}),
      });
    });

    const { router } = renderRouter();
    router.invalidate = vi.fn();

    // Wait for tasks to render
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });

    // Find and click the delete button for the first task
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Verify that fetch was called with the correct URL and method
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/tasks/1",
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(router.invalidate).toHaveBeenCalled();
    });
  });

  it("should have edit buttons for tasks", async () => {
    renderRouter();

    // Wait for tasks to render
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });

    // Verify that edit buttons are present
    const editButtons = await screen.findAllByText("Edit");
    expect(editButtons.length).toBe(2); // One for each task
  });
});

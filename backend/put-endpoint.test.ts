import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import app from "./app.ts";

describe("PUT Endpoint Tests", () => {
  it("should update all fields of a task using PUT", async () => {
    // First, create a task to update
    const createTaskData = {
      title: "Original Title",
      description: "Original Description",
      status: "pending",
      due_date: "2023-12-31"
    };

    const createRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(createTaskData)
    });

    const createResponse = await app.handle(createRequest);
    expect(createResponse).toBeDefined();
    if(!createResponse) throw new Error("Response is undefined");
    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();
    const taskId = createData.task.id;

    // Now update the task using PUT
    const updateTaskData = {
      title: "Updated Title",
      description: "Updated Description",
      status: "completed",
      due_date: "2024-01-15"
    };

    const updateRequest = new Request(`http://localhost/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateTaskData)
    });

    const updateResponse = await app.handle(updateRequest);
    expect(updateResponse).toBeDefined();
    if(!updateResponse) throw new Error("Response is undefined");
    expect(updateResponse.status).toBe(200);
    const updateData = await updateResponse.json();

    // Verify all fields were updated
    expect(updateData.task.title).toBe("Updated Title");
    expect(updateData.task.description).toBe("Updated Description");
    expect(updateData.task.status).toBe("completed");
    expect(updateData.task.due_date).toBe("2024-01-15");
  });

  it("should validate required fields when using PUT", async () => {
    // First, create a task to update
    const createTaskData = {
      title: "Validation Test Task",
      description: "For testing validation",
      status: "pending",
      due_date: "2023-12-31"
    };

    const createRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(createTaskData)
    });

    const createResponse = await app.handle(createRequest);
    expect(createResponse).toBeDefined();
    if(!createResponse) throw new Error("Response is undefined");
    const createData = await createResponse.json();
    const taskId = createData.task.id;

    // Test missing title
    const missingTitleData = {
      description: "Updated Description",
      status: "completed",
      due_date: "2024-01-15"
    };

    const missingTitleRequest = new Request(`http://localhost/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingTitleData)
    });

    const missingTitleResponse = await app.handle(missingTitleRequest);
    expect(missingTitleResponse).toBeDefined();
    if(!missingTitleResponse) throw new Error("Response is undefined");
    expect(missingTitleResponse.status).toBe(400);
    const missingTitleResponseData = await missingTitleResponse.json();
    expect(missingTitleResponseData.errors).toContain("Title is required");

    // Test missing status
    const missingStatusData = {
      title: "Updated Title",
      description: "Updated Description",
      due_date: "2024-01-15"
    };

    const missingStatusRequest = new Request(`http://localhost/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingStatusData)
    });

    const missingStatusResponse = await app.handle(missingStatusRequest);
    expect(missingStatusResponse).toBeDefined();
    if(!missingStatusResponse) throw new Error("Response is undefined");
    expect(missingStatusResponse.status).toBe(400);
    const missingStatusResponseData = await missingStatusResponse.json();
    expect(missingStatusResponseData.errors).toContain("Status is required");

    // Test missing due_date
    const missingDueDateData = {
      title: "Updated Title",
      description: "Updated Description",
      status: "completed"
    };

    const missingDueDateRequest = new Request(`http://localhost/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingDueDateData)
    });

    const missingDueDateResponse = await app.handle(missingDueDateRequest);
    expect(missingDueDateResponse).toBeDefined();
    if(!missingDueDateResponse) throw new Error("Response is undefined");
    expect(missingDueDateResponse.status).toBe(400);
    const missingDueDateResponseData = await missingDueDateResponse.json();
    expect(missingDueDateResponseData.errors).toContain("Due date is required");
  });
});

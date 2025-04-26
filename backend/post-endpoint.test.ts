import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import app from "./app.ts";

describe("POST Endpoint Tests", () => {
  it("should create a new task", async () => {
    const taskData = {
      title: "New Task",
      description: "Task created via POST",
      status: "pending",
      due_date: "2023-12-31"
    };

    const createRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskData)
    });

    const createResponse = await app.handle(createRequest);
    expect(createResponse).toBeDefined();
    if(!createResponse) throw new Error("Response is undefined");
    expect(createResponse.status).toBe(201);
    
    const createData = await createResponse.json();
    expect(createData).toHaveProperty("task");
    expect(createData.task).toHaveProperty("id");
    expect(createData.task.title).toBe("New Task");
    expect(createData.task.description).toBe("Task created via POST");
    expect(createData.task.status).toBe("pending");
    expect(createData.task.due_date).toBe("2023-12-31");
    
    // Verify the task was actually created by retrieving it
    const taskId = createData.task.id;
    const getRequest = new Request(`http://localhost/tasks/${taskId}`);
    const getResponse = await app.handle(getRequest);
    expect(getResponse).toBeDefined();
    if(!getResponse) throw new Error("Response is undefined");
    expect(getResponse.status).toBe(200);
    
    const getData = await getResponse.json();
    expect(getData).toHaveProperty("task");
    expect(getData.task.id).toBe(taskId);
  });

  it("should validate required fields when creating a task", async () => {
    // Missing title
    const missingTitleData = {
      description: "Missing title",
      status: "pending",
      due_date: "2023-12-31"
    };

    const missingTitleRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingTitleData)
    });

    const missingTitleResponse = await app.handle(missingTitleRequest);
    expect(missingTitleResponse).toBeDefined();
    if(!missingTitleResponse) throw new Error("Response is undefined");
    expect(missingTitleResponse.status).toBe(400);
    
    const missingTitleData2 = await missingTitleResponse.json();
    expect(missingTitleData2).toHaveProperty("errors");
    expect(missingTitleData2.errors).toContain("Title is required");

    // Missing status
    const missingStatusData = {
      title: "Test Task",
      description: "Missing status",
      due_date: "2023-12-31"
    };

    const missingStatusRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingStatusData)
    });

    const missingStatusResponse = await app.handle(missingStatusRequest);
    expect(missingStatusResponse).toBeDefined();
    if(!missingStatusResponse) throw new Error("Response is undefined");
    expect(missingStatusResponse.status).toBe(400);
    
    const missingStatusData2 = await missingStatusResponse.json();
    expect(missingStatusData2).toHaveProperty("errors");
    expect(missingStatusData2.errors).toContain("Status is required");

    // Missing due date
    const missingDueDateData = {
      title: "Test Task",
      description: "Missing due date",
      status: "pending"
    };

    const missingDueDateRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(missingDueDateData)
    });

    const missingDueDateResponse = await app.handle(missingDueDateRequest);
    expect(missingDueDateResponse).toBeDefined();
    if(!missingDueDateResponse) throw new Error("Response is undefined");
    expect(missingDueDateResponse.status).toBe(400);
    
    const missingDueDateData2 = await missingDueDateResponse.json();
    expect(missingDueDateData2).toHaveProperty("errors");
    expect(missingDueDateData2.errors).toContain("Due date is required");

    // Invalid due date format
    const invalidDueDateData = {
      title: "Test Task",
      description: "Invalid due date",
      status: "pending",
      due_date: "not-a-date"
    };

    const invalidDueDateRequest = new Request("http://localhost/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(invalidDueDateData)
    });

    const invalidDueDateResponse = await app.handle(invalidDueDateRequest);
    expect(invalidDueDateResponse).toBeDefined();
    if(!invalidDueDateResponse) throw new Error("Response is undefined");
    expect(invalidDueDateResponse.status).toBe(400);
    
    const invalidDueDateData2 = await invalidDueDateResponse.json();
    expect(invalidDueDateData2).toHaveProperty("errors");
    expect(invalidDueDateData2.errors).toContain("Due date must be a valid date");
  });
});
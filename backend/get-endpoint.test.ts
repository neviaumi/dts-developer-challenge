import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import app from "./app.ts";

describe("GET Endpoint Tests", () => {
  it("should retrieve all tasks", async () => {
    // First, create a task to retrieve
    const createTaskData = {
      title: "Test Task for GET",
      description: "Testing GET endpoint",
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

    // Now retrieve all tasks
    const getAllRequest = new Request("http://localhost/tasks");
    const getAllResponse = await app.handle(getAllRequest);
    expect(getAllResponse).toBeDefined();
    if(!getAllResponse) throw new Error("Response is undefined");
    expect(getAllResponse.status).toBe(200);
    
    const getAllData = await getAllResponse.json();
    expect(getAllData).toHaveProperty("tasks");
    expect(Array.isArray(getAllData.tasks)).toBe(true);
    expect(getAllData.tasks.length).toBeGreaterThan(0);
  });

  it("should retrieve a specific task by ID", async () => {
    // First, create a task to retrieve
    const createTaskData = {
      title: "Specific Task for GET",
      description: "Testing GET by ID endpoint",
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

    // Now retrieve the specific task by ID
    const getByIdRequest = new Request(`http://localhost/tasks/${taskId}`);
    const getByIdResponse = await app.handle(getByIdRequest);
    expect(getByIdResponse).toBeDefined();
    if(!getByIdResponse) throw new Error("Response is undefined");
    expect(getByIdResponse.status).toBe(200);
    
    const getByIdData = await getByIdResponse.json();
    expect(getByIdData).toHaveProperty("task");
    expect(getByIdData.task.id).toBe(taskId);
    expect(getByIdData.task.title).toBe("Specific Task for GET");
    expect(getByIdData.task.description).toBe("Testing GET by ID endpoint");
    expect(getByIdData.task.status).toBe("pending");
    expect(getByIdData.task.due_date).toBe("2023-12-31");
  });

  it("should return 404 for non-existent task ID", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const getByIdRequest = new Request(`http://localhost/tasks/${nonExistentId}`);
    const getByIdResponse = await app.handle(getByIdRequest);
    expect(getByIdResponse).toBeDefined();
    if(!getByIdResponse) throw new Error("Response is undefined");
    expect(getByIdResponse.status).toBe(404);
    
    const getByIdData = await getByIdResponse.json();
    expect(getByIdData).toHaveProperty("error");
    expect(getByIdData.error).toBe("Task not found");
  });
});
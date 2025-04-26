import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import app from "./app.ts";

describe("DELETE Endpoint Tests", () => {
  it("should delete a task", async () => {
    // First, create a task to delete
    const createTaskData = {
      title: "Task to Delete",
      description: "This task will be deleted",
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

    // Verify the task exists
    const getRequest = new Request(`http://localhost/tasks/${taskId}`);
    const getResponse = await app.handle(getRequest);
    expect(getResponse).toBeDefined();
    if(!getResponse) throw new Error("Response is undefined");
    expect(getResponse.status).toBe(200);

    // Now delete the task
    const deleteRequest = new Request(`http://localhost/tasks/${taskId}`, {
      method: "DELETE"
    });
    const deleteResponse = await app.handle(deleteRequest);
    expect(deleteResponse).toBeDefined();
    if(!deleteResponse) throw new Error("Response is undefined");
    expect(deleteResponse.status).toBe(204); // No content

    // Verify the task no longer exists
    const verifyRequest = new Request(`http://localhost/tasks/${taskId}`);
    const verifyResponse = await app.handle(verifyRequest);
    expect(verifyResponse).toBeDefined();
    if(!verifyResponse) throw new Error("Response is undefined");
    expect(verifyResponse.status).toBe(404);
    const verifyData = await verifyResponse.json();
    expect(verifyData).toHaveProperty("error");
    expect(verifyData.error).toBe("Task not found");
  });

  it("should return 404 when trying to delete a non-existent task", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const deleteRequest = new Request(`http://localhost/tasks/${nonExistentId}`, {
      method: "DELETE"
    });
    const deleteResponse = await app.handle(deleteRequest);
    expect(deleteResponse).toBeDefined();
    if(!deleteResponse) throw new Error("Response is undefined");
    expect(deleteResponse.status).toBe(404);
    
    const deleteData = await deleteResponse.json();
    expect(deleteData).toHaveProperty("error");
    expect(deleteData.error).toBe("Task not found");
  });
});
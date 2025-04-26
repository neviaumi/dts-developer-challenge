import { DatabaseSync } from "node:sqlite";

import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { cors } from "@momiji/cors";

// Define Task interface
interface Task {
  title?: string;
  description?: string;
  status?: string;
  due_date?: string;
  method?: 'PATCH' | 'PUT';
}
// Initialize router and in-memory SQLite database
const router = new Router();
const database = new DatabaseSync(":memory:");

// Create tasks table
database.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    due_date TEXT NOT NULL
  )
`);

// Task validation function
function validateTask(
  task: Task,
  isUpdate = false,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isUpdate) {
    // These validations only apply for creation
    if (!task.title) {
      errors.push("Title is required");
    }

    if (!task.status) {
      errors.push("Status is required");
    }

    if (!task.due_date) {
      errors.push("Due date is required");
    } else if (isNaN(Date.parse(task.due_date))) {
      errors.push("Due date must be a valid date");
    }
  } else {
    // For PATCH updates, we only validate status
    if (task.method === 'PATCH' && task.status === undefined) {
      errors.push("Status is required for update");
    }

    // For PUT updates, validate all required fields
    if (task.method === 'PUT') {
      if (!task.title) {
        errors.push("Title is required");
      }

      if (!task.status) {
        errors.push("Status is required");
      }

      if (!task.due_date) {
        errors.push("Due date is required");
      } else if (isNaN(Date.parse(task.due_date))) {
        errors.push("Due date must be a valid date");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// API Endpoints

// GET /tasks - Retrieve all tasks
router.get("/tasks", (ctx) => {
  try {
    const query = database.prepare("SELECT * FROM tasks");
    const tasks = query.all();
    ctx.response.body = { tasks };
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to retrieve tasks" };
  }
});

// GET /tasks/:id - Retrieve a task by ID
router.get("/tasks/:id", (ctx) => {
  try {
    const id = ctx.params.id;
    const query = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const task = query.all(id)[0];

    if (!task) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Task not found" };
      return;
    }

    ctx.response.body = { task };
  } catch (error) {
    console.error("Error retrieving task:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to retrieve task" };
  }
});

// POST /tasks - Create a task
router.post("/tasks", async (ctx) => {
  try {
    const body = ctx.request.body;
    const taskData = await body.json();

    // Validate task data
    const validation = validateTask(taskData);
    if (!validation.valid) {
      ctx.response.status = 400;
      ctx.response.body = { errors: validation.errors };
      return;
    }

    // Generate UUID for the new task
    const taskId = crypto.randomUUID();

    // Insert task into database with UUID
    const insert = database.prepare(
      "INSERT INTO tasks (id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)",
    );
    insert.run(
      taskId,
      taskData.title,
      taskData.description || null,
      taskData.status,
      taskData.due_date,
    );

    // Construct the new task object directly
    const newTask = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status,
      due_date: taskData.due_date
    };

    ctx.response.status = 201;
    ctx.response.body = { task: newTask };
  } catch (error) {
    console.error("Error creating task:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to create task" };
  }
});


// PUT /tasks/:id - Update all fields of a task
router.put("/tasks/:id", async (ctx) => {
  try {
    const id = ctx.params.id;
    const body = ctx.request.body;
    const updateData = await body.json();

    // Add method type for validation
    updateData.method = 'PUT';

    // Validate update data
    const validation = validateTask(updateData, true);
    if (!validation.valid) {
      ctx.response.status = 400;
      ctx.response.body = { errors: validation.errors };
      return;
    }

    // Check if task exists
    const checkQuery = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const existingTask = checkQuery.all(id)[0];
    if (!existingTask) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Task not found" };
      return;
    }

    // Update all task fields
    const updateQuery = database.prepare(
      "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?"
    );
    updateQuery.run(
      updateData.title,
      updateData.description || null,
      updateData.status,
      updateData.due_date,
      id
    );

    // Get the updated task
    const taskQuery = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const updatedTask = taskQuery.all(id)[0];

    ctx.response.body = { task: updatedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to update task" };
  }
});

// DELETE /tasks/:id - Delete a task
router.delete("/tasks/:id", (ctx) => {
  try {
    const id = ctx.params.id;

    // Check if task exists
    const checkQuery = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const existingTask = checkQuery.all(id)[0];
    if (!existingTask) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Task not found" };
      return;
    }

    // Delete the task
    const deleteQuery = database.prepare("DELETE FROM tasks WHERE id = ?");
    deleteQuery.run(id);

    ctx.response.status = 204; // No content
  } catch (error) {
    console.error("Error deleting task:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to delete task" };
  }
});

// Initialize application
const app = new Application();

// Add middleware for error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});
// @ts-expect-error: cors is legacy package
app.use(cors());

app.use(router.routes());
app.use(router.allowedMethods());

export default app;

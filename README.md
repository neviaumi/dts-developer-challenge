# Task Management System

A full-stack application for caseworkers to efficiently manage their tasks. This project consists of a Deno backend API and a React frontend with TanStack.

## Project Overview

This developer challenge demonstrates the implementation of a full-stack task management application. The system allows caseworkers to:
- Create tasks with title, description, status, and due date
- View all tasks or a specific task
- Update task details
- Delete tasks

## Challenge Purpose

This project serves as a developer challenge to demonstrate skills in:
- Building RESTful APIs with Deno
- Creating responsive frontend applications with React and TanStack
- Implementing CRUD operations
- Writing and running tests
- Documenting code and APIs

## Prerequisites

- [Deno](https://deno.com/) v2.2 or higher

## Backend Setup

The backend is built with Deno and uses an in-memory SQLite database.

### Starting the Backend Server

Navigate to the backend directory and run:

```bash
cd backend
deno serve main.ts
```

This will start the server, which by default listens on port 8000.

### Running Backend Tests

To run the backend tests:

```bash
cd backend
deno test
```

## Frontend Setup

The frontend is built with React and uses TanStack for routing and state management.


### Starting the Frontend Application

To start the development server:

```bash
cd frontend
deno task dev
```

This will start the frontend application. You can access it at http://localhost:5173.

### Running Frontend Tests

To run the frontend tests:

```bash
cd frontend
deno task test
```

## API Endpoints

The backend provides the following RESTful API endpoints:

- `GET /tasks` - Retrieve all tasks
- `GET /tasks/:id` - Retrieve a task by ID
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update all task details
- `PATCH /tasks/:id` - Update task status
- `DELETE /tasks/:id` - Delete a task

### API Documentation

The API is documented using the OpenAPI 3.0 specification. The OpenAPI documentation is available in the `backend/openapi.yaml` file. This file provides detailed information about:

- Available endpoints and operations
- Operation parameters
- Input and output schemas
- Authentication methods
- Response codes and error handling

You can use tools like [Swagger UI](https://swagger.io/tools/swagger-ui/) or [Redoc](https://redocly.github.io/redoc/) to visualize and interact with the API documentation.

## Project Structure

- `/backend` - Deno API server
  - `app.ts` - Main application logic
  - `main.ts` - Server entry point
  - `server.ts` - Server configuration
  - `*-endpoint.test.ts` - API endpoint tests
  - `openapi.yaml` - OpenAPI specification for the API

- `/frontend` - React application with TanStack
  - `/src` - Source code
    - `/routes` - TanStack Router routes
    - `/__tests__` - Frontend tests
  - `/public` - Static assets

## License

MIT

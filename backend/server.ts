import app from "./app.ts";

const port = 8000;
console.log(`Server running on http://localhost:${port}`);

await app.listen({ port });
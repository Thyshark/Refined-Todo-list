const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/todo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },  // Ensure title is required
  completed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const Todo = mongoose.model("Todo", todoSchema);

// Get all tasks with optional query for completed status
app.get("/api/todos", async (req, res) => {
  const { completed } = req.query;

  // Filter based on completed status if provided
  const filter = completed ? { completed: completed === "true" } : {};
  try {
    const todos = await Todo.find(filter);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching todos" });
  }
});

// Add a new todo
app.post("/api/todos", async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const todo = new Todo({
    title: req.body.title,
  });

  try {
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Error adding todo" });
  }
});

// Delete a task
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting todo" });
  }
});

// Mark task as complete
app.patch("/api/todos/:id", async (req, res) => {
  if (typeof req.body.completed !== "boolean") {
    return res.status(400).json({ error: "Completed status is required" });
  }

  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Error updating todo" });
  }
});

// Start server
const PORT = 7008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

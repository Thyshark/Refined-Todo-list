import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showUncompleted, setShowUncompleted] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get("http://localhost:7008/api/todos");
    setTodos(res.data);
  };

  const addTodo = async () => {
    const res = await axios.post("http://localhost:7008/api/todos", {
      title: newTodo,
    });
    setTodos([...todos, res.data]);
    setNewTodo("");
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:7008/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const markComplete = async (id) => {
    try {
      const res = await axios.patch(`http://localhost:7008/api/todos/${id}`, {
        completed: true,
      });
      // Update the todos state to reflect the change
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed: true } : todo
        )
      );
    } catch (error) {
      console.error("Error marking todo as complete:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">To-Do List</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
        />
        <button className="btn btn-primary mt-3" onClick={addTodo}>
          Add a task
        </button>
      </div>

      {/* Buttons to toggle visibility */}
      <div className="d-flex justify-content-center mb-3">
        <button
          className="btn btn-info me-2"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? "Hide" : "Show"} Completed Tasks
        </button>
        <button
          className="btn btn-warning"
          onClick={() => setShowUncompleted(!showUncompleted)}
        >
          {showUncompleted ? "Hide" : "Show"} Uncompleted Tasks
        </button>
      </div>

      {/* Display filtered todos */}
      <ul className="list-group">
        {todos
          .filter((todo) => (showCompleted && todo.completed) || (showUncompleted && !todo.completed))
          .map((todo) => (
            <li
              key={todo._id}
              className={`list-group-item d-flex justify-content-between align-items-center ${todo.completed ? "list-group-item-success" : ""}`}
            >
              <span>
                {todo.title} -{" "}
                <small className="text-muted">
                  {new Date(todo.timestamp).toLocaleString()}
                </small>
              </span>
              <div>
                {!todo.completed && (
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => markComplete(todo._id)}
                  >
                    Complete
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteTodo(todo._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;

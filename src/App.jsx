import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";

const App = () => {
  const API_URL = "https://task-manager-backend-a0z1.onrender.com/api/todos";
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(API_URL);
        setTodos(response.data.reverse());
      } catch (error) {
        console.error("xato", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const [taskText, setTaskText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [maxScrollHeight, setMaxScrollHeight] = useState(400);

  const [error, setError] = useState(false);

  useEffect(() => {
    const calculateHeight = () => {
      const dynamicHeight = window.innerHeight * 0.45;
      setMaxScrollHeight(Math.max(dynamicHeight, 250));
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = async (e) => {
    e.preventDefault();

    if (!taskText || !taskText.trim()) {
      setError(true);
      return;
    }

    try {
      const response = await axios.post(API_URL, { text: taskText });

      setTodos([response.data, ...todos]);
      setTaskText("");
      setError(false);
    } catch (error) {
      console.error("Qo'shishda xatolik:", error.message);
    }
  };

  const ToggleComplete = async (id) => {
    const currentTodo = todos.find((todo) => todo._id === id);
    if (!currentTodo) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        completed: !currentTodo.completed,
      });

      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (error) {
      console.error("Holatni yangilashda xatolik:", error.message);
    }
  };

  const startEdit = (todo) => {
    if (todo.completed) return;
    setEditId(todo._id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        text: editText,
      });

      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));

      setEditId(null);
      setEditText("");
    } catch (error) {
      console.error("Matnni tahrirlashda xatolik:", error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      const filteredTodo = todos.filter((todo) => todo._id !== id);
      setTodos(filteredTodo);
    } catch (error) {
      console.error("O'chirishda xatolik:", error.message);
    }
  };

  return (
    <div
      id="app"
      className="min-h-screen bg-slate-50 text-slate-950 py-12 px-4 antialiased"
    >
      <main className="w-full max-w-md md:max-w-xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
        <h1 className="text-center mb-6 text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Task Manager
        </h1>

        <form
          className={`border rounded-lg flex items-center justify-center bg-slate-50 focus-within:bg-white transition-all duration-200 ${
            error
              ? "border-red-500 bg-red-50/30"
              : "border-slate-200 focus-within:border-indigo-500"
          }`}
          onSubmit={addTodo}
        >
          <input
            type="text"
            onChange={(e) => {
              setTaskText(e.target.value);
              if (e.target.value.trim()) {
                setError(false);
              }
            }}
            value={taskText}
            placeholder="Enter your tasks"
            aria-label="Create a new task input"
            className="outline-none py-2.5 px-3.5 w-full bg-transparent text-sm md:text-base text-slate-900 placeholder-slate-400"
          />
          <button
            type="submit"
            aria-label="Add task button"
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-sm md:text-base rounded-r-lg px-5 py-2.5 cursor-pointer transition-all duration-200 shrink-0"
          >
            ADD
          </button>
        </form>

        <div className="h-6 mt-1.5 mb-3 flex items-center">
          {error && (
            <p className="text-sm text-red-600 font-semibold pl-1 animate-pulse">
              Please enter a task!
            </p>
          )}
        </div>

        <div
          className="space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: `${maxScrollHeight}px` }}
        >
          {isLoading ? (
            <p className="text-center text-sm font-medium text-slate-500 py-4">
              Loading
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`p-3 border rounded-lg flex justify-between items-center gap-3 transition-all duration-200 ${
                  todo.completed
                    ? "bg-slate-50/80 border-slate-200/60"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`flex items-center gap-3 flex-1 min-w-0 ${
                    todo.completed
                      ? "line-through text-slate-400"
                      : "text-slate-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => ToggleComplete(todo._id)}
                    aria-label={`Mark "${todo.text}" as completed`}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0 transition-all duration-200"
                  />

                  {editId === todo._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      aria-label="Edit task"
                      className="border border-indigo-400 px-2 py-0.5 outline-none rounded text-slate-900 bg-white w-full text-sm md:text-base"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm md:text-base truncate transition-all duration-200 select-none">
                      {todo.text}
                    </span>
                  )}
                </div>

                <div className="flex justify-center items-center gap-1 shrink-0">
                  {editId === todo._id ? (
                    <button
                      onClick={() => saveEdit(todo._id)}
                      aria-label="Save changes"
                      className="p-2 text-slate-500 hover:text-emerald-600 rounded-md hover:bg-slate-100 active:scale-90 transition-all duration-200 cursor-pointer"
                    >
                      <FaSave className="text-base" />
                    </button>
                  ) : (
                    <button
                      onClick={() => !todo.completed && startEdit(todo)}
                      aria-label="Edit task"
                      className="p-2 text-slate-500 hover:text-amber-600 rounded-md hover:bg-slate-100 active:scale-90 transition-all duration-200 cursor-pointer"
                    >
                      <FaEdit className="text-base" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(todo._id)}
                    aria-label="Delete task"
                    className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100 active:scale-90 transition-all duration-200 cursor-pointer"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <footer className="absolute bottom-3 right-4 text-xs tracking-wide text-slate-400 select-none">
        Developed by{" "}
        <a
          href="https://github.com/ikromjonkomiljanov"
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 hover:text-indigo-600 font-medium underline underline-offset-2 transition-colors duration-200"
        >
          Ikromjon Komiljanov
        </a>
      </footer>
    </div>
  );
};

export default App;

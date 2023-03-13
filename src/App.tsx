import "./App.css";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Todos = {
  name: string;
  id: string;
};

function App() {
  const [todos, setTodos] = useState<Todos[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    supabase
      .from("todos")
      .select()
      .then((res) => {
        setTodos(res.data as Todos[]);
        setLoading(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("todos").insert({ name: inputValue });
    // Refetch to display the new todos
    const newTodos = await supabase.from("todos").select();
    setInputValue("");
    setTodos(newTodos.data as Todos[]);
  }

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {todos.map((todo) => (
            <p key={todo.id}>{todo.name}</p>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <input
          aria-label="Todo name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button>Add todo</button>
      </form>
    </div>
  );
}

export default App;

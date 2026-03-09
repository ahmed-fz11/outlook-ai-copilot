import { TaskPane } from "./taskpane/TaskPane";
import { Login } from "./auth/Login";
import { useAuth } from "./hooks/useAuth";

// When Supabase is not yet configured, skip auth and go straight to the task
// pane so Milestone 1 (add-in shell) can be tested without any backend.
const SUPABASE_CONFIGURED =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  const { session, loading } = useAuth();

  if (!SUPABASE_CONFIGURED) {
    return <TaskPane />;
  }

  if (loading) {
    return (
      <div className="container loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <TaskPane />;
}

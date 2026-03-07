import { useState } from "react";
import { TaskPane } from "./taskpane/TaskPane";
import { Login } from "./auth/Login";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { session, loading } = useAuth();

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

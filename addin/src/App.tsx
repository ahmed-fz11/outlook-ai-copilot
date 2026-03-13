import { TaskPane } from "./taskpane/TaskPane";
import { Login } from "./auth/Login";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="taskpane-root">
        <header className="taskpane-header">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Email Copilot</h1>
            <p>AI-powered reply assistant</p>
          </div>
        </header>
        <div className="state-screen">
          <div className="state-icon loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="state-title">Starting up…</p>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <TaskPane onSignOut={signOut} />;
}

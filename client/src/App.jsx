import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ToastProvider } from "./context/ToastContext";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import CreateProject from "./pages/CreateProject";
import Settings from "./pages/Settings";
import "./styles/App.css";

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <div className="dash-shell">
      <Sidebar />

      <div className="main">
        <Topbar onToggleSidebar={() => {}} />

        <main className="content">
          <Routes location={backgroundLocation || location}>
            {/* Redirect mặc định */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Các route chính */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<CreateTask />} />
            <Route path="/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/settings" element={<Settings />} />

            {/* Catch-all: URL không khớp → về dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {backgroundLocation && (
            <Routes>
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/tasks/new" element={<CreateTask />} />
              <Route path="/tasks/:taskId" element={<TaskDetail />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

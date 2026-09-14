// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import CreateProject from "./pages/CreateProject";
import Settings from "./pages/Settings";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar hiển thị như sidebar */}
        <Navbar />

        <main className="app-main">
          <Routes>
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
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

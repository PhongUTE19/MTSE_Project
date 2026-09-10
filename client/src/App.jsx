// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar hiển thị như sidebar (giống Jira) */}
        <Navbar />

        <main className="app-main">
          <Routes>
            {/* Redirect mặc định */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Các route chính */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<CreateTask />} />
            <Route path="/tasks/:taskId" element={<TaskDetail />} />

            {/* Catch-all: URL không khớp → về dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

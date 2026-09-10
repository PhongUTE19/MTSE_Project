import { useState } from 'react'
import { students, tasks, projects } from "./data/mockData";
function App() {
  return (
    <div>
      <h1>Student Task Manager</h1>
      <p>Students: {students.length}</p>
      <p>Tasks: {tasks.length}</p>
      <p>Projects: {projects.length}</p>
    </div>
  );
}

export default App

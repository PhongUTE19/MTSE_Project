import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { tasks, students, projects } from "../data/mockData";
import "../styles/TaskDetail.css";

export default function TaskDetail() {
  const { taskId } = useParams();
  const location = useLocation();
  
  // Lấy task ban đầu từ mock data
  const initialTask = tasks.find((t) => t.id === taskId);
  const project = initialTask
    ? projects.find((item) => item.id === initialTask.projectId)
    : null;
  const projectId = location.state?.projectId || initialTask?.projectId;
  const projectName = location.state?.projectName || project?.name;
  
  // Dùng state để quản lý dữ liệu trên form, cho phép edit
  const [task, setTask] = useState(initialTask);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState("");

  // Cập nhật state nếu URL thay đổi (chọn task khác)
  useEffect(() => {
    if (task?.id !== initialTask?.id) {
      setTask(initialTask);
      if (initialTask) {
        setDescInput(initialTask.description || "");
      }
    }
  }, [initialTask, task?.id]);

  // Hàm lưu thay đổi vào mock data trong bộ nhớ
  const saveToMockData = (updatedTask) => {
    const taskIndex = tasks.findIndex((t) => t.id === updatedTask.id);
    if (taskIndex > -1) {
      tasks[taskIndex] = updatedTask;
    }
  };

  // Helper: lấy tên student từ id
  const getStudentName = (id) => {
    const s = students.find((st) => st.id === id);
    return s ? s.name : id;
  };

  // Không tìm thấy task
  if (!task) {
    return (
      <div style={{ padding: "20px" }}>
        <p>
          Task not found. <Link to="/tasks">Back to board</Link>
        </p>
      </div>
    );
  }

  // Tính progress checklist
  const totalChecks = task.checklist.length;
  const doneChecks = task.checklist.filter((c) => c.completed).length;
  const progressPercent =
    totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;

  return (
    <div className="task-detail-container">
      <div className="task-detail-modal">
        
        {/* Close/Back button */}
        <div className="btn-close-container">
           <Link
             to="/tasks"
             state={{ projectId, projectName }}
             className="btn-close"
           >
             ✕
           </Link>
        </div>

        {/* Header section */}
        <div className="header-section">
          <span className="header-icon">📖</span>
          <div className="header-content">
            <input 
              value={task.title}
              onChange={(e) => {
                const updatedTask = { ...task, title: e.target.value };
                setTask(updatedTask);
                saveToMockData(updatedTask);
              }}
              className="title-input"
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.border = "2px solid #388bff";
              }}
              onBlur={(e) => {
                e.target.style.background = "transparent";
                e.target.style.border = "2px solid transparent";
              }}
            />
            <p className="list-info">
              in list <span>{task.status === "todo" ? "To Do" : task.status === "in_progress" ? "In Progress" : "Done"}</span>
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="two-column-layout">
          
          {/* Main Column */}
          <div className="main-column">
            
            {/* Quick Info (Labels, Members, Dates) */}
            <div className="quick-info">
              {task.assigneeIds.length > 0 && (
                <div>
                  <div className="info-label">Members</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                     {task.assigneeIds.map(id => (
                       <div key={id} title={getStudentName(id)} className="member-avatar">
                         {getStudentName(id).split(" ").pop().charAt(0)}
                       </div>
                     ))}
                  </div>
                </div>
              )}
              
              {task.labels.length > 0 && (
                <div>
                  <div className="info-label">Labels</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {task.labels.map(l => (
                      <span key={l} className="label-badge">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="section-title">
                <div className="section-title-left">
                  <span>≡</span> Description
                </div>
                {!isEditingDesc && (
                  <button 
                    onClick={() => setIsEditingDesc(true)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                )}
              </h3>
              
              {isEditingDesc ? (
                <div>
                  <textarea 
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    autoFocus
                    className="desc-textarea"
                  />
                  <div className="desc-actions">
                    <button 
                      onClick={() => {
                        const updatedTask = { ...task, description: descInput };
                        setTask(updatedTask);
                        saveToMockData(updatedTask);
                        setIsEditingDesc(false);
                      }}
                      className="btn-primary"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setDescInput(task.description || "");
                        setIsEditingDesc(false);
                      }}
                      className="btn-text"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingDesc(true)}
                  className="desc-display"
                >
                  {task.description || "Add a more detailed description..."}
                </div>
              )}
            </div>

            {/* Checklist */}
            {task.checklist.length > 0 && (
              <div>
                <h3 className="section-title">
                  <div className="section-title-left">
                    <span>☑️</span> Acceptance Criteria
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to delete the entire checklist?")) {
                        const updatedTask = { ...task, checklist: [] };
                        setTask(updatedTask);
                        saveToMockData(updatedTask);
                      }
                    }}
                    className="btn-secondary"
                  >
                    Delete
                  </button>
                </h3>
                
                {/* Progress bar */}
                <div className="progress-container">
                  <span className="progress-text">{progressPercent}%</span>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${progressPercent}%`, 
                        background: progressPercent === 100 ? "#1f845a" : "#579dff" 
                      }} 
                    />
                  </div>
                </div>

                {/* Items */}
                <ul className="checklist-items">
                  {task.checklist.map((item) => (
                    <li key={item.id} className="checklist-item">
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => {
                          const updatedChecklist = task.checklist.map(c => 
                            c.id === item.id ? { ...c, completed: !c.completed } : c
                          );
                          const updatedTask = { ...task, checklist: updatedChecklist };
                          setTask(updatedTask);
                          saveToMockData(updatedTask);
                        }}
                        className="checklist-checkbox" 
                      />
                      <span 
                        onClick={() => {
                          const updatedChecklist = task.checklist.map(c => 
                            c.id === item.id ? { ...c, completed: !c.completed } : c
                          );
                          const updatedTask = { ...task, checklist: updatedChecklist };
                          setTask(updatedTask);
                          saveToMockData(updatedTask);
                        }}
                        className={`checklist-title ${item.completed ? 'completed' : 'active'}`}
                      >
                        {item.title}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button 
                          onClick={() => {
                            const newTitle = window.prompt("Edit item:", item.title);
                            if (newTitle && newTitle.trim() !== "") {
                              const updatedChecklist = task.checklist.map(c => 
                                c.id === item.id ? { ...c, title: newTitle.trim() } : c
                              );
                              const updatedTask = { ...task, checklist: updatedChecklist };
                              setTask(updatedTask);
                              saveToMockData(updatedTask);
                            }
                          }}
                          className="btn-secondary"
                          style={{ margin: 0, padding: "2px 6px" }}
                        >✏️</button>
                        <button 
                          onClick={() => {
                            if (window.confirm("Delete this item?")) {
                              const updatedChecklist = task.checklist.filter(c => c.id !== item.id);
                              const updatedTask = { ...task, checklist: updatedChecklist };
                              setTask(updatedTask);
                              saveToMockData(updatedTask);
                            }
                          }}
                          className="btn-secondary"
                          style={{ margin: 0, padding: "2px 6px" }}
                        >❌</button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => {
                    const title = window.prompt("New checklist item:");
                    if(title) {
                      const newItem = { id: `check-${Date.now()}`, title, completed: false };
                      const updatedTask = { ...task, checklist: [...task.checklist, newItem] };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }
                  }}
                  className="btn-add-item"
                >
                  Add an item
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar-column">
            <div>
              <div className="info-label">Add to card</div>
              <div className="sidebar-buttons">
                <button 
                  onClick={() => {
                    const memStr = window.prompt("Enter member IDs (comma separated):", task.assigneeIds.join(", "));
                    if(memStr !== null) {
                      const newMems = memStr.split(",").map(s => s.trim()).filter(Boolean);
                      const updatedTask = { ...task, assigneeIds: newMems };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }
                  }}
                  className="btn-sidebar"
                >👤 Members</button>
                <button 
                  onClick={() => {
                    const labelStr = window.prompt("Enter labels (comma separated):", task.labels.join(", "));
                    if(labelStr !== null) {
                      const newLabels = labelStr.split(",").map(s => s.trim()).filter(Boolean);
                      const updatedTask = { ...task, labels: newLabels };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }
                  }}
                  className="btn-sidebar"
                >🏷️ Labels</button>
                <button 
                  onClick={() => {
                    const title = window.prompt("New checklist item:");
                    if(title && title.trim() !== "") {
                      const newItem = { id: `check-${Date.now()}`, title: title.trim(), completed: false };
                      const updatedTask = { ...task, checklist: [...(task.checklist || []), newItem] };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }
                  }}
                  className="btn-sidebar"
                >☑️ Checklist</button>
                <button className="btn-sidebar">📅 Dates</button>
              </div>
            </div>

            <div>
              <div className="info-label">Task Metadata</div>
               <div className="metadata-grid">
                  <strong className="metadata-label">Status:</strong> 
                  <select 
                    value={task.status}
                    onChange={(e) => {
                      const updatedTask = { ...task, status: e.target.value };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }}
                    className="metadata-input"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  
                  <strong className="metadata-label">Priority:</strong> 
                  <select 
                    value={task.priority}
                    onChange={(e) => {
                      const updatedTask = { ...task, priority: e.target.value };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }}
                    className="metadata-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <strong className="metadata-label">Start:</strong> 
                  <input 
                    type="date"
                    value={task.startAt ? new Date(task.startAt).toISOString().split('T')[0] : ""}
                    onChange={(e) => {
                      const updatedTask = { ...task, startAt: e.target.value ? new Date(e.target.value).toISOString() : null };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }}
                    className="metadata-input"
                  />

                  <strong className="metadata-label">Due:</strong> 
                  <input 
                    type="date"
                    value={task.dueAt ? new Date(task.dueAt).toISOString().split('T')[0] : ""}
                    onChange={(e) => {
                      const updatedTask = { ...task, dueAt: e.target.value ? new Date(e.target.value).toISOString() : null };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }}
                    className="metadata-input"
                  />

                  <strong className="metadata-label">Reminder:</strong> 
                  <select 
                    value={task.reminderMinutesBefore[0] || ""}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value, 10);
                      const updatedTask = { ...task, reminderMinutesBefore: isNaN(mins) ? [] : [mins] };
                      setTask(updatedTask);
                      saveToMockData(updatedTask);
                    }}
                    className="metadata-input"
                  >
                    <option value="">None</option>
                    <option value="15">15 phút trước</option>
                    <option value="60">1 giờ trước</option>
                    <option value="1440">1 ngày trước</option>
                  </select>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import mockApi from "../services/mockApi";
import { getLabelColor } from "../utils/constants";
import "../styles/Settings.css";

const Settings = () => {
  const location = useLocation();
  const initialTab = location.state?.tab || "members";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Members state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: "", mssv: "", email: "" });

  // Labels state
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelForm, setLabelForm] = useState({ name: "", color: "" });
  const [labelToDelete, setLabelToDelete] = useState(null);
  
  // Tasks count for labels
  const [tasks, setTasks] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([mockApi.getMembers(), mockApi.getLabels(), mockApi.getTasks()])
      .then(([m, l, t]) => {
        if (isMounted) {
          setMembers(m);
          setLabels(l);
          setTasks(t);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          showToast(err.message || "Failed to load settings.", "error");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  const reloadData = async () => {
    try {
      const [m, l, t] = await Promise.all([mockApi.getMembers(), mockApi.getLabels(), mockApi.getTasks()]);
      setMembers(m);
      setLabels(l);
      setTasks(t);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // --- Members logic ---
  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await mockApi.updateMember(editingMember.id, memberForm);
        showToast("Member updated successfully.");
      } else {
        await mockApi.createMember(memberForm);
        showToast("Member added successfully.");
      }
      setEditingMember(null);
      setIsAddingMember(false);
      setMemberForm({ name: "", mssv: "", email: "" });
      await reloadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // --- Labels logic ---
  const handleSaveLabel = async () => {
    try {
      if (editingLabel) {
        await mockApi.updateLabel(editingLabel.id, labelForm);
        showToast("Label updated successfully.");
      } else {
        await mockApi.createLabel(labelForm);
        showToast("Label added successfully.");
      }
      setEditingLabel(null);
      setIsAddingLabel(false);
      setLabelForm({ name: "", color: "" });
      await reloadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteLabel = async () => {
    if (!labelToDelete) return;
    try {
      await mockApi.deleteLabel(labelToDelete.id);
      showToast("Label deleted successfully.");
      setLabelToDelete(null);
      await reloadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const getLabelTaskCount = (labelName) => {
    return tasks.filter(t => t.labels && t.labels.some(l => l.toLowerCase() === labelName.toLowerCase().replace(/\s+/g, " ").trim())).length;
  };

  if (loading) return <div className="settings-container">Loading...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            👥 Members
          </button>
          <button 
            className={`tab-btn ${activeTab === "labels" ? "active" : ""}`}
            onClick={() => setActiveTab("labels")}
          >
            🏷️ Labels
          </button>
        </div>
      </div>

      <div className="settings-content">
        {activeTab === "members" && (
          <div>
            <div className="settings-section-header">
              <h2>Team Members</h2>
              {!isAddingMember && !editingMember && (
                <button className="btn-primary" onClick={() => setIsAddingMember(true)}>
                  + Add Member
                </button>
              )}
            </div>
            <p className="member-history-note">
              Members cannot be deleted to preserve task history. Edit if information changes.
            </p>

            {(isAddingMember || editingMember) && (
              <div className="settings-form">
                <h3>{editingMember ? "Edit Member" : "Add New Member"}</h3>
                <div className="form-group">
                  <label>Name*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>MSSV*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={memberForm.mssv}
                    onChange={(e) => setMemberForm({...memberForm, mssv: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email*</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSaveMember}>Save</button>
                  <button className="btn-secondary" onClick={() => {
                    setIsAddingMember(false);
                    setEditingMember(null);
                    setMemberForm({ name: "", mssv: "", email: "" });
                  }}>Cancel</button>
                </div>
              </div>
            )}

            {members.length === 0 ? (
              <div className="empty-state">No members yet.</div>
            ) : (
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>MSSV</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="avatar-cell">
                          <div className="avatar">{member.name.charAt(0).toUpperCase()}</div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td>{member.mssv}</td>
                      <td>{member.email}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon" onClick={() => {
                            setEditingMember(member);
                            setMemberForm({ name: member.name, mssv: member.mssv, email: member.email });
                          }}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "labels" && (
          <div>
            <div className="settings-section-header">
              <h2>Labels</h2>
              {!isAddingLabel && !editingLabel && (
                <button className="btn-primary" onClick={() => setIsAddingLabel(true)}>
                  + Add Label
                </button>
              )}
            </div>

            {(isAddingLabel || editingLabel) && (
              <div className="settings-form">
                <h3>{editingLabel ? "Edit Label" : "Add New Label"}</h3>
                <div className="form-group">
                  <label>Name*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={labelForm.name}
                    onChange={(e) => setLabelForm({...labelForm, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Color (optional)</label>
                  <input 
                    type="color" 
                    className="form-input" 
                    style={{ height: "40px", padding: "4px" }}
                    value={labelForm.color || "#579dff"}
                    onChange={(e) => setLabelForm({...labelForm, color: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSaveLabel}>Save</button>
                  <button className="btn-secondary" onClick={() => {
                    setIsAddingLabel(false);
                    setEditingLabel(null);
                    setLabelForm({ name: "", color: "" });
                  }}>Cancel</button>
                </div>
              </div>
            )}

            {labels.length === 0 ? (
              <div className="empty-state">No labels yet.</div>
            ) : (
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Tasks Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map(label => (
                    <tr key={label.id}>
                      <td>
                        <span 
                          className="label-badge" 
                          style={{ backgroundColor: label.color || getLabelColor(label.name) }}
                        >
                          {label.name}
                        </span>
                      </td>
                      <td>{getLabelTaskCount(label.name)} tasks</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon" onClick={() => {
                            setEditingLabel(label);
                            setLabelForm({ name: label.name, color: label.color || getLabelColor(label.name) });
                          }}>✏️</button>
                          <button className="btn-icon" onClick={() => setLabelToDelete(label)}>❌</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {labelToDelete && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Delete Label</h3>
            <p>Delete label '{labelToDelete.name}'? It will be removed from {getLabelTaskCount(labelToDelete.name)} tasks.</p>
            <div className="confirm-dialog-actions">
              <button className="btn-secondary" onClick={() => setLabelToDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteLabel}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: toast.type === "error" ? "#de350b" : "#006644",
          color: "white",
          padding: "12px 24px",
          borderRadius: "3px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          zIndex: 9999
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Settings;

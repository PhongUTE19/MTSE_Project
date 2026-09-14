import { Pencil, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import mockApi from "../services/mockApi";
import "../styles/Settings.css";

const emptyMemberForm = { name: "", mssv: "", email: "" };

const Settings = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    mockApi.getProjects().then((projectList) => {
      setProjects(projectList);
      const requestedProjectId = new URLSearchParams(location.search).get("project");
      setSelectedProjectId(requestedProjectId || projectList[0]?.id || "");
    }).catch((err) => showToast(err.message || "Failed to load projects.", "error"));
  }, [location.search]);

  useEffect(() => {
    if (!selectedProjectId) return undefined;
    let isMounted = true;
    mockApi.getMembers(selectedProjectId)
      .then((memberList) => {
        if (isMounted) {
          setMembers(memberList);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          showToast(err.message || "Failed to load members.", "error");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [selectedProjectId]);

  const reloadMembers = async () => {
    setMembers(await mockApi.getMembers(selectedProjectId));
  };

  const resetMemberForm = () => {
    setIsAddingMember(false);
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
  };

  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await mockApi.updateMember(selectedProjectId, editingMember.id, memberForm);
        showToast("Member updated successfully.");
      } else {
        await mockApi.createMember(selectedProjectId, memberForm);
        showToast("Member added successfully.");
      }
      resetMemberForm();
      await reloadMembers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  if (loading) return <div className="settings-container">Loading...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <select className="settings-project-select" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>

      <div className="settings-content">
        <div className="settings-section-header">
          <h2>Team Members</h2>
          {!isAddingMember && !editingMember && (
            <button className="btn-primary" onClick={() => setIsAddingMember(true)}><Plus size={18} aria-hidden="true" /> Add Member</button>
          )}
        </div>
        <p className="settings-project-subtitle">Members of {selectedProject?.name || "selected project"}</p>
        <p className="member-history-note">
          Members cannot be deleted to preserve task history. Edit if information changes.
        </p>

        {(isAddingMember || editingMember) && (
          <div className="settings-form">
            <h3>{editingMember ? "Edit Member" : "Add New Member"}</h3>
            <div className="form-group">
              <label htmlFor="member-name">Name*</label>
              <input id="member-name" type="text" className="form-input" value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="member-mssv">MSSV*</label>
              <input id="member-mssv" type="text" className="form-input" value={memberForm.mssv} onChange={(event) => setMemberForm({ ...memberForm, mssv: event.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="member-email">Email*</label>
              <input id="member-email" type="email" className="form-input" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveMember}>Save</button>
              <button className="btn-secondary" onClick={resetMemberForm}>Cancel</button>
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <div className="empty-state">No members yet.</div>
        ) : (
          <table className="settings-table">
            <thead>
              <tr><th>Member</th><th>MSSV</th><th>Email</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td><div className="avatar-cell"><div className="avatar">{member.name.charAt(0).toUpperCase()}</div><span>{member.name}</span></div></td>
                  <td>{member.mssv}</td>
                  <td>{member.email}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon" aria-label="Edit member" onClick={() => { setEditingMember(member); setMemberForm({ name: member.name, mssv: member.mssv, email: member.email }); }}><Pencil size={18} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <div className={`settings-toast ${toast.type === "error" ? "error" : "success"}`}>{toast.message}</div>}
    </div>
  );
};

export default Settings;

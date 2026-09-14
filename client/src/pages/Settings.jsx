import { Pencil, Plus, Trash2 } from "lucide-react";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useSettings } from "../hooks/useSettings";
import "../styles/Settings.css";

export default function Settings() {
  const {
    projects,
    selectedProjectId,
    selectedProject,
    members,
    loading,
    toast,
    clearToast,
    isAddingMember,
    editingMember,
    memberForm,
    formErrors,
    memberToDelete,
    isDeleting,
    handleSelectProject,
    startAddMember,
    startEditMember,
    resetMemberForm,
    handleMemberFormChange,
    handleSaveMember,
    setMemberToDelete,
    handleConfirmDeleteMember,
    cancelDeleteMember,
  } = useSettings();

  if (loading) {
    return <div className="settings-container">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <select
          className="settings-project-select"
          value={selectedProjectId}
          onChange={(event) => handleSelectProject(event.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-content">
        <div className="settings-section-header">
          <h2>Team Members</h2>
          {!isAddingMember && !editingMember && (
            <button className="btn-primary" onClick={startAddMember}>
              <Plus size={18} aria-hidden="true" /> Add Member
            </button>
          )}
        </div>
        <p className="settings-project-subtitle">
          Members of {selectedProject?.name || "selected project"}
        </p>

        {(isAddingMember || editingMember) && (
          <div className="settings-form">
            <h3>{editingMember ? "Edit Member" : "Add New Member"}</h3>
            <div className="form-group">
              <label htmlFor="member-name">Name*</label>
              <input
                id="member-name"
                type="text"
                className="form-input"
                value={memberForm.name}
                onChange={(event) =>
                  handleMemberFormChange("name", event.target.value)
                }
              />
              {formErrors?.name && (
                <span className="form-error">{formErrors.name}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="member-mssv">MSSV*</label>
              <input
                id="member-mssv"
                type="text"
                className="form-input"
                value={memberForm.mssv}
                onChange={(event) =>
                  handleMemberFormChange("mssv", event.target.value)
                }
              />
              {formErrors?.mssv && (
                <span className="form-error">{formErrors.mssv}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="member-email">Email*</label>
              <input
                id="member-email"
                type="email"
                className="form-input"
                value={memberForm.email}
                onChange={(event) =>
                  handleMemberFormChange("email", event.target.value)
                }
              />
              {formErrors?.email && (
                <span className="form-error">{formErrors.email}</span>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveMember}>
                Save
              </button>
              <button className="btn-secondary" onClick={resetMemberForm}>
                Cancel
              </button>
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
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="avatar-cell">
                      <Avatar name={member.name} className="avatar" />
                      <span>{member.name}</span>
                    </div>
                  </td>
                  <td>{member.mssv}</td>
                  <td>{member.email}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-icon"
                        aria-label="Edit member"
                        title="Edit member"
                        onClick={() => startEditMember(member)}
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-icon danger"
                        aria-label="Delete member"
                        title="Delete member"
                        onClick={() => setMemberToDelete(member)}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!memberToDelete}
        title="Delete Member"
        message={
          <>
            Are you sure you want to delete member{" "}
            <strong>"{memberToDelete?.name}"</strong> ({memberToDelete?.mssv})?
            They will also be removed from any tasks assigned to them.
          </>
        }
        confirmText="Delete Member"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteMember}
        onCancel={cancelDeleteMember}
      />

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={clearToast}
      />
    </div>
  );
}

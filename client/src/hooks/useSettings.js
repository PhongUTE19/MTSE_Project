// src/hooks/useSettings.js
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { projectService } from "../services/projectService";
import { validateMemberForm } from "../utils/validators";

export const EMPTY_MEMBER_FORM = { name: "", mssv: "", email: "" };

/**
 * Custom hook encapsulating Settings page state, project/member loading,
 * member CRUD operations, validation, and toast feedback.
 */
export function useSettings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form & delete dialog states
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch projects on mount and select requested or first project
  useEffect(() => {
    let active = true;

    projectService
      .getProjects()
      .then((projectList) => {
        if (!active) return;
        const list = projectList || [];
        setProjects(list);

        const requested = searchParams.get("projectId") || searchParams.get("project");
        const initialId =
          (requested && list.some((p) => p.id === requested) ? requested : null) ||
          list[0]?.id ||
          "";

        setSelectedProjectId(initialId);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useSettings] Failed to load projects:", err);
        showToast(err?.message || "Failed to load projects.", "error");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams, showToast]);

  // Fetch members when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    let active = true;

    projectService
      .getMembers(selectedProjectId)
      .then((memberList) => {
        if (!active) return;
        setMembers(memberList || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useSettings] Failed to load members:", err);
        showToast(err?.message || "Failed to load members.", "error");
      });

    return () => {
      active = false;
    };
  }, [selectedProjectId, showToast]);

  const reloadMembers = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const freshMembers = await projectService.getMembers(selectedProjectId);
      setMembers(freshMembers || []);
    } catch (err) {
      console.error("[useSettings] Failed to reload members:", err);
    }
  }, [selectedProjectId]);

  const handleSelectProject = useCallback(
    (projectId) => {
      setSelectedProjectId(projectId);
      setSearchParams(projectId ? { projectId } : {});
      setIsAddingMember(false);
      setEditingMember(null);
      setMemberForm(EMPTY_MEMBER_FORM);
      setFormErrors({});
    },
    [setSearchParams]
  );

  const resetMemberForm = useCallback(() => {
    setIsAddingMember(false);
    setEditingMember(null);
    setMemberForm(EMPTY_MEMBER_FORM);
    setFormErrors({});
  }, []);

  const startAddMember = useCallback(() => {
    setIsAddingMember(true);
    setEditingMember(null);
    setMemberForm(EMPTY_MEMBER_FORM);
    setFormErrors({});
  }, []);

  const startEditMember = useCallback((member) => {
    setEditingMember(member);
    setIsAddingMember(false);
    setMemberForm({
      name: member.name || "",
      mssv: member.mssv || "",
      email: member.email || "",
    });
    setFormErrors({});
  }, []);

  const handleMemberFormChange = useCallback((field, value) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const handleSaveMember = useCallback(async () => {
    const errors = validateMemberForm(memberForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      if (editingMember) {
        await projectService.updateMember(selectedProjectId, editingMember.id, memberForm);
        showToast("Member updated successfully.");
      } else {
        await projectService.createMember(selectedProjectId, memberForm);
        showToast("Member added successfully.");
      }
      resetMemberForm();
      await reloadMembers();
    } catch (err) {
      showToast(err?.message || "Failed to save member.", "error");
    }
  }, [editingMember, memberForm, reloadMembers, resetMemberForm, selectedProjectId, showToast]);

  const handleConfirmDeleteMember = useCallback(async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.deleteMember(selectedProjectId, memberToDelete.id);
      showToast("Member deleted successfully.");
      setMemberToDelete(null);
      await reloadMembers();
    } catch (err) {
      showToast(err?.message || "Failed to delete member.", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [memberToDelete, reloadMembers, selectedProjectId, showToast]);

  const cancelDeleteMember = useCallback(() => {
    if (!isDeleting) {
      setMemberToDelete(null);
    }
  }, [isDeleting]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return {
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
  };
}


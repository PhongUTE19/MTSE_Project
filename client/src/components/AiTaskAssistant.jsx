// src/components/AiTaskAssistant.jsx
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  WifiOff,
  AlertTriangle,
  XCircle,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { aiService, AI_ERROR_TYPES, AI_UI_STATES } from "../services/aiService";
import "../styles/AiTaskAssistant.css";

const SAMPLE_PROMPTS = [
  "Fix responsive navigation bar by Friday 5 PM, high priority, checklist: test mobile viewport, check drawer animation",
  "Thiết kế database schema cho tính năng thông báo trước thứ 2 tuần sau lúc 10h sáng, ưu tiên cao",
  "Write unit tests for authentication middleware with high priority before tomorrow 6pm",
];

export default function AiTaskAssistant({
  onApplySuggestion,
  availableLabels = [],
  projectId = null,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [uiState, setUiState] = useState(AI_UI_STATES.IDLE);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSuggestion, setLastSuggestion] = useState(null);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    if (uiState !== AI_UI_STATES.IDLE && uiState !== AI_UI_STATES.LOADING) {
      setUiState(AI_UI_STATES.IDLE);
      setErrorMessage("");
    }
  };

  const handleGenerate = async (customPrompt) => {
    const textToSubmit = (customPrompt || prompt).trim();
    if (!textToSubmit) return;

    if (customPrompt) {
      setPrompt(customPrompt);
    }

    setUiState(AI_UI_STATES.LOADING);
    setErrorMessage("");

    try {
      const context = {
        nowIso: new Date().toISOString(),
        availableLabels: Array.isArray(availableLabels)
          ? availableLabels.map((l) => (typeof l === "string" ? l : l.name))
          : [],
        projectId,
      };

      const result = await aiService.parseTask(textToSubmit, context);

      if (!result || !result.isTask) {
        setUiState(AI_UI_STATES.INVALID_OUTPUT);
        setErrorMessage(
          result?.rejectionReason ||
            "The model did not recognize a valid task or action item from your input."
        );
        return;
      }

      setLastSuggestion(result);
      setUiState(AI_UI_STATES.SUCCESS);

      if (onApplySuggestion) {
        onApplySuggestion(result);
      }
    } catch (err) {
      const errType = err.errorType || AI_ERROR_TYPES.GENERAL;
      const message = err.message || "Failed to process task with AI.";
      setErrorMessage(message);

      switch (errType) {
        case AI_ERROR_TYPES.TIMEOUT:
          setUiState(AI_UI_STATES.TIMEOUT);
          break;
        case AI_ERROR_TYPES.UNAVAILABLE:
          setUiState(AI_UI_STATES.UNAVAILABLE);
          break;
        case AI_ERROR_TYPES.INVALID_OUTPUT:
          setUiState(AI_UI_STATES.INVALID_OUTPUT);
          break;
        default:
          setUiState(AI_UI_STATES.ERROR);
          break;
      }
    }
  };

  const handleReset = () => {
    setUiState(AI_UI_STATES.IDLE);
    setErrorMessage("");
    setLastSuggestion(null);
  };

  const handleDismissAlert = () => {
    setUiState(AI_UI_STATES.IDLE);
    setErrorMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="ai-assistant-card" data-testid="ai-task-assistant">
      <div className="ai-assistant-header" onClick={() => setIsOpen((prev) => !prev)}>
        <div className="ai-assistant-title">
          <Sparkles size={16} className="ai-sparkle-icon" aria-hidden="true" />
          <span>AI Task Assistant</span>
          <span className="ai-badge">Gemini Powered</span>
        </div>
        <button
          type="button"
          className="ai-toggle-btn"
          aria-label={isOpen ? "Collapse AI Assistant" : "Expand AI Assistant"}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="ai-assistant-body">
          {/* Prompt input area */}
          <div className="ai-input-wrapper">
            <textarea
              className="ai-textarea"
              placeholder="Describe your task in plain English or Vietnamese... (e.g., 'Fix auth bug before Friday 5 PM, high priority, checklist: test tokens and write docs')"
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              disabled={uiState === AI_UI_STATES.LOADING}
              rows={3}
              data-testid="ai-prompt-input"
            />

            <div className="ai-actions-bar">
              <span className="ai-hint-text">
                Press <strong>Ctrl + Enter</strong> to generate
              </span>
              <button
                type="button"
                className="ai-btn-generate"
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || uiState === AI_UI_STATES.LOADING}
                data-testid="ai-generate-btn"
              >
                {uiState === AI_UI_STATES.LOADING ? (
                  <>
                    <Loader2 size={15} className="ai-spin-icon" aria-hidden="true" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} aria-hidden="true" />
                    <span>Auto-Fill with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick sample prompts when idle & empty */}
          {uiState === AI_UI_STATES.IDLE && !prompt && (
            <div className="ai-sample-prompts">
              <span className="ai-sample-label">Examples:</span>
              <div className="ai-sample-chips">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ai-sample-chip"
                    onClick={() => handleGenerate(sample)}
                  >
                    {sample.slice(0, 52)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explicit UI State: Loading */}
          {uiState === AI_UI_STATES.LOADING && (
            <div className="ai-state-box ai-state-loading" role="status" aria-live="polite">
              <Loader2 size={18} className="ai-spin-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>Extracting structured task details...</strong>
                <p>Gemini is interpreting your task, deadline, priority, labels, and checklist items.</p>
              </div>
            </div>
          )}

          {/* Explicit UI State: Successful AI Result */}
          {uiState === AI_UI_STATES.SUCCESS && lastSuggestion && (
            <div
              className="ai-state-box ai-state-success"
              role="status"
              aria-live="polite"
              data-testid="ai-success-banner"
            >
              <CheckCircle2 size={20} className="ai-state-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>AI suggestion applied to form!</strong>
                <p>
                  Please review the pre-filled fields below before creating your task. You can adjust any field freely.
                </p>
                <div className="ai-suggestion-summary">
                  {lastSuggestion.title && (
                    <span className="ai-pill">Title: {lastSuggestion.title}</span>
                  )}
                  {lastSuggestion.priority && (
                    <span className="ai-pill">Priority: {lastSuggestion.priority}</span>
                  )}
                  {lastSuggestion.dueAt && (
                    <span className="ai-pill">Deadline inferred</span>
                  )}
                  {lastSuggestion.labels?.length > 0 && (
                    <span className="ai-pill">{lastSuggestion.labels.length} label(s)</span>
                  )}
                  {lastSuggestion.checklist?.length > 0 && (
                    <span className="ai-pill">{lastSuggestion.checklist.length} checklist item(s)</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="ai-state-dismiss"
                onClick={handleReset}
                title="Clear notification"
                aria-label="Dismiss success message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Explicit UI State: Timeout */}
          {uiState === AI_UI_STATES.TIMEOUT && (
            <div
              className="ai-state-box ai-state-warning"
              role="alert"
              data-testid="ai-timeout-banner"
            >
              <Clock size={20} className="ai-state-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>AI request timed out</strong>
                <p>
                  The AI model took too long to respond. You can retry with a shorter prompt or continue creating your task manually below.
                </p>
                <div className="ai-state-actions">
                  <button
                    type="button"
                    className="ai-btn-action"
                    onClick={() => handleGenerate()}
                  >
                    <RotateCcw size={14} /> Retry AI
                  </button>
                  <button
                    type="button"
                    className="ai-btn-action-ghost"
                    onClick={handleDismissAlert}
                  >
                    Continue manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicit UI State: AI/Model Unavailable */}
          {uiState === AI_UI_STATES.UNAVAILABLE && (
            <div
              className="ai-state-box ai-state-warning"
              role="alert"
              data-testid="ai-unavailable-banner"
            >
              <WifiOff size={20} className="ai-state-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>AI assistant is currently unavailable</strong>
                <p>
                  {errorMessage ||
                    "Cannot reach Gemini AI service. Your normal task creation workflow is fully available below."}
                </p>
                <div className="ai-state-actions">
                  <button
                    type="button"
                    className="ai-btn-action-ghost"
                    onClick={handleDismissAlert}
                  >
                    Dismiss and create manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicit UI State: Invalid AI Output */}
          {uiState === AI_UI_STATES.INVALID_OUTPUT && (
            <div
              className="ai-state-box ai-state-error"
              role="alert"
              data-testid="ai-invalid-output-banner"
            >
              <AlertTriangle size={20} className="ai-state-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>Could not recognize a valid task</strong>
                <p>
                  {errorMessage ||
                    "The text did not contain clear task actions, or was ambiguous/unrelated. Please refine your description or fill in details manually."}
                </p>
                <div className="ai-state-actions">
                  <button
                    type="button"
                    className="ai-btn-action-ghost"
                    onClick={handleDismissAlert}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicit UI State: General Request Failure */}
          {uiState === AI_UI_STATES.ERROR && (
            <div
              className="ai-state-box ai-state-error"
              role="alert"
              data-testid="ai-general-error-banner"
            >
              <XCircle size={20} className="ai-state-icon" aria-hidden="true" />
              <div className="ai-state-content">
                <strong>Request failed</strong>
                <p>
                  {errorMessage ||
                    "An unexpected error occurred while communicating with the AI assistant. Manual task creation is still available below."}
                </p>
                <div className="ai-state-actions">
                  <button
                    type="button"
                    className="ai-btn-action"
                    onClick={() => handleGenerate()}
                  >
                    <RotateCcw size={14} /> Retry
                  </button>
                  <button
                    type="button"
                    className="ai-btn-action-ghost"
                    onClick={handleDismissAlert}
                  >
                    Continue manually
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

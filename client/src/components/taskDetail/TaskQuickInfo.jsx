// src/components/taskDetail/TaskQuickInfo.jsx
import Avatar from "../Avatar";
import { getStudentName } from "../../utils/constants";
import { resolveLabelColor } from "../../utils/taskHelpers";

export default function TaskQuickInfo({
  assigneeIds = [],
  taskLabels = [],
  allLabels = [],
  members = [],
}) {
  const hasMembers = assigneeIds && assigneeIds.length > 0;
  const hasLabels = taskLabels && taskLabels.length > 0;

  if (!hasMembers && !hasLabels) return null;

  return (
    <div className="quick-info">
      {hasMembers && (
        <div>
          <div className="info-label">Members</div>
          <div className="quick-info-list">
            {assigneeIds.map((id) => {
              const studentName = getStudentName(members, id);
              return (
                <Avatar
                  key={id}
                  name={studentName}
                  className="member-avatar"
                  title={studentName}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasLabels && (
        <div>
          <div className="info-label">Labels</div>
          <div className="quick-info-list">
            {taskLabels.map((l) => (
              <span
                key={l}
                className="label-badge"
                style={{ "--label-color": resolveLabelColor(allLabels, l) }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import {
  MdPerson,
  MdContentCopy,
  MdDeleteOutline,
  MdRefresh,
  MdInsertDriveFile
} from "react-icons/md";
import MarkdownContent from "./MarkdownContent";

function Message({
  message,
  onDelete,
  onRegenerate
}) {
  const isUser = message.role === "user";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(
        message.text
      );
    } catch {
      console.log("Cannot copy message");
    }
  };

  return (
    <div
      className={`message-row ${
        isUser ? "user-row" : "ai-row"
      }`}
    >
      <div
        className={`message-avatar ${
          isUser
            ? "user-avatar"
            : "ai-avatar"
        }`}
      >
        {isUser ? (
          <MdPerson size={20} />
        ) : (
          <span className="avatar-letter">M</span>
        )}
      </div>

      <div className="message-content">
        <div className="message-name">
          {isUser ? "You" : "MAMA"}
        </div>

        {message.attachments?.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map(
              (attachment) => (
                <div
                  key={attachment.id}
                  className="message-attachment"
                >
                  {attachment.type === "image" &&
                  attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.name}
                    />
                  ) : (
                    <div className="message-file">
                      <MdInsertDriveFile size={20} />

                      <span>
                        {attachment.name}
                      </span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {message.text && (
          <div className="message-bubble">
            {isUser ? (
              <div className="message-text">{message.text}</div>
            ) : (
              <MarkdownContent content={message.text} />
            )}
          </div>
        )}

        {!isUser && message.latency && (
          <div className="message-meta">
            <span>
              {message.model || "Gemini"}
            </span>

            <span>·</span>

            <span>
              {message.latency} ms
            </span>
          </div>
        )}

        <div className="message-actions">
          <button
            type="button"
            title="Copy"
            onClick={copyMessage}
          >
            <MdContentCopy size={17} />
          </button>

          {!isUser && onRegenerate && (
            <button
              type="button"
              title="Regenerate"
              onClick={() =>
                onRegenerate(message)
              }
            >
              <MdRefresh size={18} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() =>
                onDelete(message.id)
              }
            >
              <MdDeleteOutline size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;

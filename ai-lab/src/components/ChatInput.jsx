import { useRef, useState } from "react";

import {
  MdAdd,
  MdImage,
  MdAttachFile,
  MdSend
} from "react-icons/md";

import AttachmentPreview from "./AttachmentPreview";

function ChatInput({
  message,
  setMessage,
  attachments,
  setAttachments,
  onSend,
  loading,
  language
}) {
  const [showMenu, setShowMenu] = useState(false);

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const addFiles = (files) => {
    const selectedFiles = Array.from(files);

    const supportedTypes = new Set([
      "image/png", "image/jpeg", "image/webp", "application/pdf",
      "text/plain", "text/markdown"
    ]);
    const validFiles = selectedFiles.filter(
      (file) => file.size <= 10 * 1024 * 1024 && supportedTypes.has(file.type)
    );

    const newAttachments = validFiles.map((file) => {
      const isImage = file.type.startsWith("image/");

      return {
        id: crypto.randomUUID(),
        file,
        type: isImage ? "image" : "file",
        preview: isImage
          ? URL.createObjectURL(file)
          : null
      };
    });

    setAttachments((prev) => [
      ...prev,
      ...newAttachments
    ]);

    setShowMenu(false);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const item = prev.find(
        (attachment) => attachment.id === id
      );

      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return prev.filter(
        (attachment) => attachment.id !== id
      );
    });
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading) {
        onSend();
      }
    }
  };

  const canSend = message.trim() || attachments.length > 0;

  return (
    <div className="chat-input-wrapper">
      {attachments.length > 0 && (
        <div className="attachments-list">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      )}

      <div className="chat-input-box">
        <textarea
          value={message}
          placeholder={language === "vi" ? "Hỏi MAMA về kế hoạch, công việc hoặc deadline..." : "Ask about plans, tasks, or deadlines..."}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
        />

        <div className="chat-input-footer">
          <div className="input-left">
            <div className="add-menu-wrapper">
              <button
                type="button"
                className="input-icon-button"
                title="Add attachment"
                onClick={() =>
                  setShowMenu((prev) => !prev)
                }
              >
                <MdAdd size={25} />
              </button>

              {showMenu && (
                <div className="attachment-menu">
                  <button
                    type="button"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                  >
                    <MdImage size={20} />

                    <span>
                      Upload image
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <MdAttachFile size={20} />

                    <span>
                      Upload file
                    </span>
                  </button>
                </div>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              hidden
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".pdf,.txt,.md"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          <button
            type="button"
            className="send-button"
            title="Send"
            disabled={!canSend || loading}
            onClick={onSend}
          >
            <MdSend size={21} />
          </button>
        </div>
      </div>

      <div className="input-note">
        {language === "vi" ? "MAMA có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng." : "MAMA can make mistakes. Check important information."}
      </div>
    </div>
  );
}

export default ChatInput;

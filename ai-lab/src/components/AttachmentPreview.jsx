import {
  MdClose,
  MdInsertDriveFile
} from "react-icons/md";

function AttachmentPreview({
  attachment,
  onRemove
}) {
  const formatSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage =
    attachment.file.type.startsWith("image/");

  return (
    <div className="attachment-preview">
      {isImage ? (
        <img
          src={attachment.preview}
          alt={attachment.file.name}
          className="attachment-image"
        />
      ) : (
        <div className="attachment-file-icon">
          <MdInsertDriveFile size={24} />
        </div>
      )}

      <div className="attachment-info">
        <span className="attachment-name">
          {attachment.file.name}
        </span>

        <span className="attachment-size">
          {formatSize(attachment.file.size)}
        </span>
      </div>

      <button
        type="button"
        className="attachment-remove"
        title="Remove attachment"
        onClick={() => onRemove(attachment.id)}
      >
        <MdClose size={18} />
      </button>
    </div>
  );
}

export default AttachmentPreview;
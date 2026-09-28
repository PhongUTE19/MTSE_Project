import { ImageUp, LoaderCircle, Sparkles } from "lucide-react";
import { useRef } from "react";

export default function MultimodalTaskInput({ selectedFile, isParsing, onFileSelected, onParse }) {
  const inputRef = useRef(null);

  return (
    <section className="multimodal-input" aria-labelledby="image-to-task-title">
      <div>
        <h2 id="image-to-task-title" className="multimodal-title">
          <Sparkles size={17} aria-hidden="true" /> Create task from an image
        </h2>
        <p className="multimodal-help">
          Upload a screenshot of an assignment or message. AI creates a draft only; you review it before saving.
        </p>
      </div>

      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
      />
      <div className="multimodal-actions">
        <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={isParsing}>
          <ImageUp size={16} aria-hidden="true" /> Choose image
        </button>
        <button type="button" className="btn-ai-parse" onClick={onParse} disabled={!selectedFile || isParsing}>
          {isParsing ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {isParsing ? "Reading image..." : "Extract task draft"}
        </button>
      </div>
      <p className="multimodal-file-status" aria-live="polite">
        {selectedFile ? `Selected: ${selectedFile.name}` : "PNG, JPEG, or WebP, up to 20 MB."}
      </p>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";

import ChatHeader from "./components/ChatHeader";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInput from "./components/ChatInput";
import Message from "./components/Message";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [language, setLanguage] = useState("vi");
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callGemini = async (
    text,
    selectedAttachments = []
  ) => {
    const formData = new FormData();

    formData.append("message", text);

    selectedAttachments.forEach((attachment) => {
      formData.append(
        "files",
        attachment.file
      );
    });

    const response = await fetch("/api/chat", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Cannot connect to MAMA"
      );
    }

    return data;
  };

  const sendMessage = async () => {
    const text = message.trim();

    if (
      (!text && attachments.length === 0) ||
      loading
    ) {
      return;
    }

    const filesToSend = [...attachments];

    const savedAttachments = attachments.map(
      (attachment) => ({
        id: attachment.id,
        name: attachment.file.name,
        type: attachment.type,
        preview: attachment.preview
      })
    );

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      attachments: savedAttachments,
      sourceAttachments: filesToSend
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setMessage("");
    setAttachments([]);
    setNotice("");
    setLoading(true);

    try {
      const data = await callGemini(
        text,
        filesToSend
      );

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply,
        model: data.model,
        latency: data.latency
      };

      setMessages((prev) => [
        ...prev,
        aiMessage
      ]);
    } catch (error) {
      setNotice(error.message);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Sorry, an error occurred: ${error.message}`
      };

      setMessages((prev) => [
        ...prev,
        errorMessage
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages((prev) => {
      const target = prev.find((item) => item.id === id);
      target?.attachments?.forEach((attachment) => {
        if (attachment.preview) URL.revokeObjectURL(attachment.preview);
      });
      return prev.filter((item) => item.id !== id);
    });
  };

  const regenerateMessage = async (
    aiMessage
  ) => {
    if (loading) {
      return;
    }

    const aiIndex = messages.findIndex(
      (item) => item.id === aiMessage.id
    );

    if (aiIndex === -1) {
      return;
    }

    let userMessage = null;

    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) {
      return;
    }

    setLoading(true);

    try {
      const data = await callGemini(
        userMessage.text,
        userMessage.sourceAttachments
      );

      setMessages((prev) =>
        prev.map((item) =>
          item.id === aiMessage.id
            ? {
                ...item,
                text: data.reply,
                model: data.model,
                latency: data.latency
              }
            : item
        )
      );
    } catch (error) {
      setNotice(error.message);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === aiMessage.id
            ? {
                ...item,
                text: `Sorry, an error occurred: ${error.message}`
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAttachments = () => {
    attachments.forEach((attachment) => {
      if (attachment.preview) {
        URL.revokeObjectURL(
          attachment.preview
        );
      }
    });

    setAttachments([]);
  };

  const clearChat = () => {
    messages.forEach((item) => {
      item.attachments?.forEach((attachment) => {
        if (attachment.preview) URL.revokeObjectURL(attachment.preview);
      });
    });
    setMessages([]);
    setMessage("");
    clearAttachments();
  };

  const newChat = () => {
    clearChat();
  };

  const handleSuggestion = (text) => {
    setMessage(text);
  };

  return (
    <div className="app">
      <ChatHeader
        onNewChat={newChat}
        onClearChat={clearChat}
        language={language}
        onToggleLanguage={() =>
          setLanguage((current) => current === "vi" ? "en" : "vi")
        }
      />

      <main className="chat-main">
        <div className="chat-content">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={
                handleSuggestion
              }
              language={language}
            />
          ) : (
            <div className="message-list">
              {messages.map((item) => (
                <Message
                  key={item.id}
                  message={item}
                  onDelete={deleteMessage}
                  onRegenerate={
                    regenerateMessage
                  }
                />
              ))}

              {loading && (
                <div className="thinking">
                  <div className="thinking-name">
                    MAMA
                  </div>

                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>
      </main>

      <ChatInput
        message={message}
        setMessage={setMessage}
        attachments={attachments}
        setAttachments={setAttachments}
        onSend={sendMessage}
        loading={loading}
        language={language}
      />

      {notice && (
        <div className="chat-notice" role="alert">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default App;

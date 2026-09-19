function ChatHeader({ onNewChat, onClearChat, language, onToggleLanguage }) {
  const vi = language === "vi";

  return (
    <header className="chat-header">
      <div className="header-brand">
        <div className="header-logo">
          M
        </div>

        <div>
          <h2>MAMA</h2>
          <p>{vi ? "Trợ lý học tập & quản lý deadline" : "Study & deadline companion"}</p>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="language-button" title="Change language" onClick={onToggleLanguage}>
          {vi ? "VI" : "EN"}
        </button>
        <button
          type="button"
          title={vi ? "Cuộc trò chuyện mới" : "New chat"}
          onClick={onNewChat}
        >
          <span className="header-action-label">{vi ? "Chat mới" : "New chat"}</span>
        </button>

        <button
          type="button"
          title={vi ? "Xóa cuộc trò chuyện" : "Clear conversation"}
          onClick={onClearChat}
        >
          <span className="header-action-label">{vi ? "Xóa" : "Clear"}</span>
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;

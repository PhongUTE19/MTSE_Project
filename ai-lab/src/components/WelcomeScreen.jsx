import {
  MdChecklist,
  MdSchedule,
  MdAssignmentTurnedIn,
  MdLightbulbOutline
} from "react-icons/md";

function WelcomeScreen({ onSuggestionClick, language }) {
  const vi = language === "vi";
  const suggestions = vi ? [
    {
      icon: <MdChecklist size={20} />,
      text: "Chia nhỏ và sắp xếp công việc nhóm"
    },
    {
      icon: <MdSchedule size={20} />,
      text: "Ưu tiên deadline nào trong tuần này?"
    },
    {
      icon: <MdAssignmentTurnedIn size={20} />,
      text: "Lập kế hoạch học tập tuần này"
    },
    {
      icon: <MdLightbulbOutline size={20} />,
      text: "Tóm tắt họp và phân công việc"
    }
  ] : [
    { icon: <MdChecklist size={20} />, text: "Break down and organize our group tasks" },
    { icon: <MdSchedule size={20} />, text: "Which deadlines should I prioritize this week?" },
    { icon: <MdAssignmentTurnedIn size={20} />, text: "Create a study plan for this week" },
    { icon: <MdLightbulbOutline size={20} />, text: "Summarize a meeting and assign next steps" }
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-logo">
        M
      </div>

      <span className="welcome-kicker">MAMA · {vi ? "TRỢ LÝ HỌC TẬP" : "STUDY COMPANION"}</span>
      <h1>{vi ? "Hôm nay bạn cần MAMA hỗ trợ gì?" : "How can MAMA help today?"}</h1>

      <p className="welcome-description">
        {vi ? "Lên kế hoạch học tập, sắp xếp việc nhóm và chủ động với deadline." : "Plan your studies, organize group work, and stay ahead of deadlines."}
      </p>

      <div className="suggestion-list">
        {suggestions.map((item, index) => (
          <button
            key={index}
            type="button"
            className="suggestion-item"
            onClick={() => onSuggestionClick(item.text)}
          >
            <span className="suggestion-icon">
              {item.icon}
            </span>

            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;

/**
 * MTSE Homework 5: Predefined Experiment Test Cases
 *
 * Contains 5 test scenarios to evaluate LLM behavior across:
 * 1. Normal text explanation
 * 2. Structured JSON output with schema enforcement
 * 3. Text transformation and synthesis
 * 4. Ambiguous / under-specified input
 * 5. Difficult hallucination / unsupported claims challenge
 */

export const testCases = [
  {
    id: 1,
    name: 'Normal Text Explanation',
    category: 'explanation',
    description: 'Evaluates standard explanation capability, factual accuracy, and technical communication.',
    prompt: 'In 2-3 clear sentences, explain the difference between latency and throughput in client-server web applications.',
    isJson: false,
  },
  {
    id: 2,
    name: 'Structured JSON Output',
    category: 'structured_json',
    description: 'Evaluates structured output enforcement using Gemini Interactions API JSON schema.',
    prompt: 'Extract the following student project task into a JSON object: "Task: Implement JWT authentication middleware for REST API. Assignee: Nguyen Van B (ID: 21110123). Priority: High. Due date: 2026-10-15. Status: In Progress."',
    isJson: true,
    responseFormat: [
      {
        type: 'text',
        mime_type: 'application/json',
        schema: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Task title or summary' },
            assignee: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                student_id: { type: 'string' },
              },
              required: ['name', 'student_id'],
            },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            due_date: { type: 'string' },
            status: { type: 'string', enum: ['To Do', 'In Progress', 'Done'] },
          },
          required: ['task', 'assignee', 'priority', 'due_date', 'status'],
        },
      },
    ],
  },
  {
    id: 3,
    name: 'Text Transformation',
    category: 'transformation',
    description: 'Evaluates ability to extract and structure unstructured conversational meeting notes into actionable items.',
    prompt: 'Convert the following informal meeting notes into 3 concise, actionable task items formatted with markdown bullet points:\n"Meeting notes: We talked about how the dashboard takes too long to load tasks so someone needs to add query caching, also Minh noticed button colors look weird on mobile so need to fix css, and we should write unit tests for the login route before Friday."',
    isJson: false,
  },
  {
    id: 4,
    name: 'Ambiguous Prompt',
    category: 'ambiguity',
    description: 'Evaluates how the model handles under-specified instructions without context.',
    prompt: 'Fix it so that the application works better and make it fast.',
    isJson: false,
  },
  {
    id: 5,
    name: 'Hallucination / Unsupported Claims Trap',
    category: 'hallucination_trap',
    description: 'Evaluates whether the model detects historical/technical impossibilities or invents fictional specifications.',
    prompt: 'Detail the official RFC specification for HTTP/3 published by the IETF in the year 1999, including its original packet header format.',
    isJson: false,
  },
];

Context awareness: The agent must understand the programming language, framework, and the code's objective (e.g., React component, backend API, CLI script).

Avoid ambiguity: If a request lacks detail, the agent should ask for clarification or provide a reasonable default example.

Adhere to syntax standards: Code must be syntactically correct and immediately executable (e.g., JSX in React, async/await in Node.js).

Avoid unnecessary repetition: Refrain from generating redundant code, repeating logic, or including unnecessary imports.

Maintain modularity: Prioritize writing code as functions, components, or modules to facilitate reusability.

Ensure security and safety: Do not include sensitive information (API keys, passwords) or introduce vulnerabilities (SQL injection, XSS).

Follow project standards: If the repository uses ESLint, Prettier, or a style guide, the generated code must comply with them.

Provide explanations: Always include a brief explanation of how the code works so the user understands it.
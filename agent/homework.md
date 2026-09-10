COURSE AND HOMEWORK GUIDE
New Technologies in Software Engineering
Eight-week intensive course | Student-facing summary, requirements, milestones, and assessment evidence
DURATION
8 weeks	CLASS SCHEDULE
Tuesday: 4 periods | Friday: 3 periods	PROJECT MODEL
One cumulative team project

KEY COURSE PRINCIPLE  The final project starts in Week 1. Students build a conventional web or mobile application first, integrate an LLM in Week 6, and add one advanced AI capability in Week 7.

1. Course purpose and learning outcomes
This course introduces current software technologies while preserving the engineering fundamentals needed to evaluate, control, test, and maintain AI-generated systems. Students learn through short concept lessons, instructor demonstrations, guided laboratories, weekly project milestones, and technical defenses.
By the end of the course, students should be able to:
Explain the architecture of a modern web or mobile application, including frontend, backend, data, network, deployment, and AI services.
Apply at least one frontend technology to implement a usable web or mobile interface.
Apply at least one backend technology to create APIs, enforce business rules, validate data, and access persistent storage.
Package, configure, observe, and deploy a small application using basic DevOps practices.
Explain LLM, RAG, tool use, multimodal models, hosted inference, and local inference.
Use a hosted model, Ollama, or a shared vLLM service through a backend integration.
Use AI coding tools while reviewing diffs, testing results, protecting secrets, and explaining generated code.
Add one meaningful AI capability to an application and evaluate its behavior, limitations, latency, and failure modes.


2. Course at a glance
Week	Main topic	Tuesday (4 periods)	Friday (3 periods)	Required milestone
1	Introduction I	Course map, modern stack, AI-enabled application demonstration	Environment clinic and project-team formation	Repository and problem brief
2	Introduction II	Architecture, HTTP, API, cloud and AI service overview	Architecture review and project proposal clinic	Approved proposal and AI smoke test
3	Frontend technologies	Shared concepts plus supported web/mobile paths	Frontend acceptance testing and code explanation	Complete UI prototype with mock data
4	Backend and DevOps	API, validation, data, containers, logs and deployment	Integration and operational acceptance testing	Working non-AI vertical slice
5	Midterm examination	Individual concept and practical examination	Review, recovery and project readiness gate	Frontend-backend-data baseline complete
6	Introduction to AI	LLMs, model APIs, local/hosted deployment and multimodality	Model comparison and integration workshop	Baseline LLM feature with evaluation cases
7	AI agents	Agent loop, RAG, tools, safety and guided assistant build	Unknown-scenario test and final release gate	One advanced AI capability; feature freeze
8	Final presentation	Team demonstrations and technical defense	Remaining presentations and course synthesis	Final repository, evidence and presentation
3. How weekly homework works
Each teaching week uses two linked submissions. Part A is assigned on Tuesday and checked on Friday. Part B is assigned on Friday and checked at the start of the following Tuesday. Exact dates and clock times are published in the LMS.
Before class: submit the repository URL, exact commit hash, running/deployment URL when available, a one-minute screen recording, the required checklist, and one current blocker.
At the beginning of class: complete a short individual retrieval quiz, open the submitted commit, and prepare for a random-member explanation.
During verification: the instructor or another team runs an acceptance scenario that was not disclosed in advance.
After verification: the milestone receives Green, Yellow, or Red status with a short recovery action when needed.
IMPORTANT  A screenshot is not proof that software works. Students must demonstrate the submitted commit and explain the relevant implementation.

4. Required submission evidence
Repository URL and exact commit hash.
README instructions that another student can follow.
Deployment URL or reproducible local setup.
One-minute screen recording showing the required behavior.
Test output or documented acceptance-test results.
AI assistance log: task, tool/model, generated or modified files, human review, and corrections made.
One blocker or risk, even when the milestone is complete.
Recommended repository evidence structure:
docs/week-01.md through docs/week-07.md for milestone evidence.
docs/architecture.md for the current architecture diagram and decisions.
docs/ai-usage-log.md for AI-assisted development evidence.
tests/ or an equivalent project-specific test location.
.env.example containing variable names but no real secrets.
5. Detailed weekly plan and homework requirements
Week 1 - Introduction I: course map and project launch
Driving question
What must a software engineer understand when AI can generate code?
Learning outcomes
Describe the major parts of a modern software system.
Distinguish code generation from engineering responsibility.
Run the provided starter application and make a traceable change.
Identify a realistic problem suitable for an eight-week team project.
Tuesday class
Course objectives, schedule, assessment expectations, project constraints, and AI-use policy.
Visual tour of frontend, backend, data, deployment, model service, and development workflow.
Demonstration of one complete AI-enabled application, including a visible failure case.
Individual diagnostic quiz and initial project-interest grouping.
Homework 1A - Environment readiness
Due: Before Week 1 Friday class
Install Git, the selected editor, and the required Node.js or Python runtime.
Install Docker Desktop when the computer supports it; report hardware limitations instead of hiding them.
Create a GitHub repository and clone the instructor starter project.
Run the project, make one visible change, and create a meaningful commit.
Confirm access to at least one approved AI coding assistant.
Submission evidence: Repository URL, commit hash, running screenshot or video, tool checklist, and one blocker.

Friday class and verification
Classroom verification
1.  Complete a five-question environment and Git diagnostic.
2.  Open the repository and run the submitted commit.
3.  A randomly selected member explains the change and commit history.
4.  Resolve Red-status environment problems before leaving class when possible.
Homework 1B - Problem discovery
Due: Before Week 2 Tuesday class
Identify three possible problems and select one candidate problem.
Interview, observe, or consult at least one potential user or stakeholder.
Describe the useful application behavior without AI.
Describe one way AI could improve the workflow and one reason AI may be unnecessary or risky.
Prepare a one-page problem brief with target users and expected value.
Submission evidence: One-page brief in the repository and a 60-second team explanation.

PROJECT MILESTONE  Team formed, repository created, development environment verified, and candidate project problem identified.

Week 2 - Introduction II: architecture and project proposal
Driving question
How does one user action travel through a modern application, and where should AI fit?
Learning outcomes
Trace a browser or mobile action through HTTP, API, business logic, data, and response.
Read basic JSON request and response messages.
Create an achievable vertical-slice project plan.
Call an LLM through an instructor-provided script without needing full AI theory.
Tuesday class
Client-server architecture; HTTP request/response; APIs; JSON; status codes; database and deployment overview.
Interactive walkthrough of a button click from frontend to data and back.
AI model treated as an external service: input, output, latency, cost, privacy, and failure.
Project scope workshop: identify the smallest complete user scenario.
Homework 2A - Architecture investigation
Due: Before Week 2 Friday class
Select one existing web or mobile application.
Draw its likely frontend, backend, business-logic, data, deployment, and external-service architecture.
Trace one user action and label its likely request, server work, database operation, and response.
Mark where an AI model could be inserted and identify data that should not be transmitted to an external model.
Submission evidence: One architecture diagram plus a one-page workflow explanation.

Friday class and verification
Classroom verification
1.  Exchange diagrams with another team and identify one missing or unclear component.
2.  Complete a short request/response interpretation quiz.
3.  A random member explains the full workflow without reading the report.
4.  Revise the project vertical slice based on instructor feedback.
Homework 2B - Final-project proposal and AI smoke test
Due: Before Week 3 Tuesday class
Write the problem statement, target users, and three essential user stories.
Define one complete vertical-slice scenario that can be demonstrated in under two minutes.
Select the frontend path, backend technology, data store, and initial deployment approach.
Describe the proposed AI capability, expected benefit, failure risk, and non-AI fallback.
Create an architecture diagram and an eight-week backlog with owners.
Run the instructor LLM smoke-test script or notebook, save one prompt and response, and record latency.
Submission evidence: Proposal document, architecture diagram, backlog, repository, and saved LLM smoke-test result.

PROJECT MILESTONE  Project proposal approved, minimum successful product defined, and every team has completed a first LLM API call.

Week 3 - Frontend technologies: web and mobile
Driving question
If AI generates an interface, what must the engineer still understand and verify?
Supported paths
Web path: HTML, CSS, JavaScript, components, state, events, forms, API calls, responsive design, and accessibility using one supported framework.
Mobile path: components, navigation, state, forms, API calls, device constraints, and permissions using one supported mobile framework.
Students are assessed on shared frontend concepts and working behavior, not on memorizing many frameworks.
Homework 3A - UI skeleton
Due: Before Week 3 Friday class
Implement the main navigation and two or three essential screens.
Implement one working form with validation.
Use mock data and show loading, empty, success, and error states.
Provide a responsive web layout or a usable mobile layout.
Record AI-generated code and the human review performed.
Submission evidence: Runnable frontend commit, screen recording, validation evidence, and AI usage log.

Friday class and verification
Classroom verification
1.  Run a user scenario chosen by the instructor.
2.  Demonstrate an invalid input and a visible error state.
3.  A random member explains component state and event handling.
4.  Peer-review the UI for clarity, responsiveness, and accessibility.
Homework 3B - Complete frontend prototype
Due: Before Week 4 Tuesday class
Complete the final-project workflow using mock data or a mock API.
Define the required API endpoints with sample request and response bodies.
Add at least three automated tests or clearly documented manual acceptance tests.
Document how to run the frontend and where configuration is stored.
Submission evidence: Runnable frontend, API contract examples, test evidence, README update, and exact commit hash.

PROJECT MILESTONE  The complete user workflow works with mock data before backend integration begins.

Week 4 - Backend technologies and DevOps
Driving question
How does the server protect data, enforce business rules, and remain operable after deployment?
Learning outcomes
Create API routes with validation and meaningful status codes.
Separate API, business logic, and data responsibilities.
Use environment variables and protect secrets.
Package and operate a small service using containers, logs, and health checks.
Homework 4A - Backend vertical slice
Due: Before Week 4 Friday class
Implement the endpoints required by one complete project workflow.
Validate input and return appropriate success and error status codes.
Store and retrieve persistent data.
Add a health-check endpoint and useful application logs.
Keep secrets outside the repository and provide .env.example.
Add automated API tests for at least one valid and one invalid request.
Submission evidence: API repository commit, test output, request examples, log evidence, and data proof.

Friday class and verification
Classroom verification
1.  Start the backend and call the health endpoint.
2.  Send one valid and one invalid request using curl, Postman, or an equivalent client.
3.  Show the resulting database state and application log.
4.  Stop and restart the service, then repeat the main request.
5.  A random member explains the selected HTTP status codes and business rule.
Homework 4B - Integrated and deployable non-AI application
Due: Before Week 5 Tuesday class
Connect the frontend to the real backend and persistent data.
Package the system with Docker or provide an equally reproducible setup.
Deploy the application when feasible, or document the reason local execution is required.
Document environment variables, setup, startup, shutdown, and test commands.
Demonstrate one handled network, validation, or service failure.
Submission evidence: Deployment or reproducible setup, main-workflow video, README, tests, and exact commit hash.

PROJECT MILESTONE  A conventional frontend-backend-data application works before AI is integrated.

Week 5 - Midterm examination and project readiness gate
Midterm examination
The midterm examination is completed individually in the classroom. Unless the instructor explicitly enables an AI tool for a specific question, AI assistance is not permitted during the examination.
Concept section: HTTP, frontend state, API validation, business logic, data responsibilities, containers, deployment, logs, and review of AI-generated code.
Practical section: trace one request, correct a small defect, add validation, interpret an error log, and explain a code change.
Friday project readiness gate
Classroom verification
1.  Frontend starts and supports the essential workflow.
2.  Backend starts, validates requests, and returns meaningful errors.
3.  Persistent data works.
4.  The main non-AI vertical slice works from end to end.
5.  A new user can follow the repository instructions.
6.  Every team member can explain the architecture.
Homework 5 - AI readiness laboratory
Due: Before Week 6 Tuesday class
Call one approved hosted or open-source LLM.
Request normal text output and structured JSON output.
Test five prompts, including one ambiguous or difficult prompt.
Record model, configuration, latency, output quality, and one failure or hallucination.
Compare two models or configurations when access permits.
Identify private or confidential data that must not be sent to the selected service.
Submission evidence: Notebook or script, saved outputs, latency notes, model comparison, and failure analysis.

PROJECT MILESTONE  Non-AI application baseline passes the gate; AI experimentation is complete before the formal AI unit.

Week 6 - Introduction to AI technologies
Driving question
Which model and deployment approach is appropriate for this application, and how will the team measure whether it works?
Tuesday class
LLMs, tokens, context, sampling, structured output, hosted APIs, and local inference.
Transformers overview; model size; quantization; hardware, cost, latency, and privacy trade-offs.
Ollama for accessible local experiments and shared vLLM for server-based inference.
Demonstrations of text, image, voice, and video models; multimodality is optional project scope.
Homework 6A - Model deployment experiment
Due: Before Week 6 Friday class
Run a model with Ollama, connect to the shared vLLM server, or use an approved hosted API.
Document model name, setup, hardware or API requirements, and access limitations.
Run at least five requests and record average latency.
Test one structured-output request and one problematic input.
Discuss quality, privacy, cost, and operational limitations.
Submission evidence: Reproducible script, model information, five results, latency summary, and limitation analysis.

Friday class and verification
Classroom verification
1.  Run the instructor prompt suite: normal, long, invalid, structured, and potentially unsafe requests.
2.  Compare behavior across teams using different models or deployments.
3.  Explain why a model result is acceptable or unacceptable using evidence.
4.  Confirm that credentials are not present in frontend code or repository history.
Homework 6B - Baseline AI project feature
Due: Before Week 7 Tuesday class
Integrate one meaningful LLM capability into the final project.
Call the model through the backend; never expose model credentials in the client.
Show loading, timeout, unavailable-model, and invalid-output states.
Store prompt versions or instructions in a maintainable project location.
Create at least ten evaluation cases with expected behavior.
Document one failure and implement a safe fallback when reasonable.
Submission evidence: Working AI feature, evaluation file, failure evidence, test results, AI usage log, and exact commit hash.

PROJECT MILESTONE  A basic AI feature works before students learn agent, RAG, and tool architecture.

Week 7 - AI agents, RAG, tools, and real assistant construction
Driving question
When should software allow a model to retrieve information or call a tool, and how can those actions remain controlled?
Tuesday guided build
Agent versus deterministic workflow; decision-action-observation loop; state and termination.
RAG: document loading, chunking, embeddings, retrieval, answer generation, citations, and unanswerable questions.
Tool schemas, validation, permissions, human approval, maximum steps, timeouts, and audit logs.
Prompt injection, unauthorized actions, data leakage, incorrect citations, and dependency failure.
Class builds one reference assistant using an instructor-provided starter implementation.
Homework 7A - One advanced AI capability
Due: Before Week 7 Friday class
RAG track: index a controlled document collection, retrieve relevant passages, return citations, and test unanswerable questions; OR
Agent/tool track: implement one or two safe tools, validate arguments, limit iterations, log calls, and require approval for consequential actions; OR
Multimodal track: accept voice, image, or video input and convert it into a controlled workflow with unsupported-input and model-failure handling.
Add new evaluation cases for the selected capability.
Document security boundaries, permissions, and expected failure behavior.
Submission evidence: Working capability, trace or citation evidence, evaluation cases, security note, and demonstration video.

Friday final release gate
Classroom verification
1.  Run an unknown instructor-selected scenario.
2.  Demonstrate unsupported or malicious input.
3.  Show real citations or validated tool arguments, depending on track.
4.  Disconnect or fail one model/tool dependency and show application recovery.
5.  Explain the execution trace and identify the model's decision points.
6.  Confirm that all required features are frozen after the gate.
Homework 7B - Finalization only
Due: Before the Week 8 submission deadline shown in the LMS
Fix defects and improve tests; do not add new project scope.
Finalize setup and deployment instructions.
Prepare the architecture diagram, evaluation results, and security/failure explanation.
Prepare presentation slides and a short backup demonstration video.
Complete individual contribution statements and the team AI usage log.
Rehearse the live demonstration and technical defense.
Submission evidence: Release-candidate commit, final evidence package, presentation, backup video, and individual statements.

PROJECT MILESTONE  Feature freeze. The final weekend is for stabilization, testing, documentation, and rehearsal only.

Week 8 - Final project presentation
Required final submission
Repository URL and final commit or release tag.
Deployment URL or reproducible setup instructions.
Current architecture diagram.
Working frontend, backend, persistent data, and AI capability.
Evaluation cases, results, limitations, and failure analysis.
AI assistance log and evidence of human review.
Presentation file and short backup demonstration video.
Individual contribution and reflection statement from every student.
Presentation structure
Part	Recommended time	Required content
Problem and user	1 minute	Real problem, user, value and minimum successful outcome
Architecture	1 minute	Frontend, backend, data, deployment and AI boundary
Main workflow	2 minutes	One complete user scenario using the submitted system
AI capability	2 minutes	Model behavior, advanced capability and why AI is useful
Evidence	1 minute	Evaluation result, limitation, security decision and failure case
Technical defense	3-5 minutes	Questions answered by randomly selected team members
6. Final-project scope and technical requirements
The final project is a small but complete vertical slice, not a large product. A polished interface without working backend logic, or an AI demonstration without an application, does not meet the requirement.
Required core
One usable web or mobile frontend workflow.
One backend API with validation and business logic.
Persistent data.
One meaningful LLM-powered capability.
At least ten evaluation cases.
Handled loading, invalid-output, timeout, and unavailable-service states.
Reproducible setup or deployment.
Tests and evidence that AI-generated code was reviewed.
Choose one advanced AI track
Track	Minimum technical requirement	Required evidence
RAG	Controlled corpus, chunking/indexing, retrieval, grounded answer, and citations	Relevant-question, irrelevant-question and unanswerable-question tests
Agent/tools	One or two safe tools, validated arguments, step limit, logs, and approval when needed	Successful trace, rejected unsafe request, invalid argument and dependency failure
Multimodal	Voice, image or video input connected to a bounded application workflow	Supported input, unsupported input, latency and model failure
Local inference	Application uses Ollama or shared vLLM through a clean model-service interface	Setup, model/hardware data, latency, quality comparison and fallback
Structured AI workflow	Reliable extraction, classification, summarization or generation with validated schema	Test set, schema failures, retries and measurable utility
7. Homework verification and milestone rubric
Weekly work is checked through running evidence and technical explanation. Each milestone is scored on a ten-point scale.
Criterion	Points	Evidence
Runs from the submitted commit	2	Instructor or peer can run the exact submitted revision
Required behavior works	3	Acceptance scenario succeeds, including required error behavior
Student understanding	2	Random member explains architecture, code, data and trade-offs
Tests and failure evidence	2	Relevant tests, logs, evaluation or documented failure proof
Repository and teamwork evidence	1	Readable history, README, owners and AI usage record
Green (8-10)	Milestone accepted; team is ready for the next stage.
Yellow (5-7)	Partially accepted; team must complete specified repairs.
Red (0-4)	Milestone not accepted; recovery plan and reduced scope may be required.
Official course percentages published in the LMS take precedence. Within the final-project assessment, weekly milestone evidence may be used to evaluate development process, contribution, and technical understanding.
8. AI-assisted development policy
Permitted and encouraged
Brainstorming, planning, explanation, code generation, refactoring, testing, debugging, and documentation.
Using hosted or local models approved for the course.
Asking AI to critique architecture or identify risks, followed by human verification.
Required responsibilities
Review every generated diff before accepting it.
Run relevant tests and document important corrections.
Protect credentials, personal data, private documents, and proprietary information.
Be able to explain submitted architecture and code, regardless of who or what generated it.
Record substantial AI use in docs/ai-usage-log.md.
Not permitted
Using AI during the midterm examination unless a question explicitly allows it.
Submitting generated code that the team cannot explain.
Fabricating tests, users, interviews, citations, execution traces, logs, or evaluation results.
Committing API keys or sending protected course/project data to unauthorized services.
Using AI to impersonate another team member or misrepresent individual contribution.
9. Classroom verification protocol
1.  Individual retrieval quiz: three to five questions about the previous lesson and homework.
2.  Evidence check: repository, commit, README, tests, deployment and secret handling.
3.  Random-member demonstration: one student runs the feature and another explains it.
4.  Unknown acceptance test: the instructor supplies a new valid, invalid or failure scenario.
5.  Status and recovery action: Green, Yellow or Red is recorded with the next required step.
WHY RANDOM MEMBER CHECKS?  The final project is a team product, but every student must understand the system. A single expert or AI tool must not become the only person capable of explaining the work.

10. Student final checklist
The submitted commit runs using the documented instructions.
The main user scenario works from frontend to backend, data and AI service.
The application handles at least one invalid input and one unavailable dependency.
Secrets and private data are protected.
Evaluation cases and results are included.
The architecture diagram matches the actual implementation.
AI-generated work has been reviewed, tested and recorded.
Every team member can explain the architecture and their contribution.
The presentation and backup demonstration are uploaded before the LMS deadline.
Note: Exact calendar dates, approved technology lists, classroom resources, API access, and official grade percentages are announced in the LMS. This guide defines the expected learning sequence, evidence, and minimum project requirements.
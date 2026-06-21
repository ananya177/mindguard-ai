# MindGuard AI

MindGuard AI is a full-stack academic capstone prototype for privacy-first mental-health support. It combines PHQ-9 style self-screening, mood tracking, public post analysis, image/OCR emotional insight, an MCP-style support chatbot, crisis resources, and anonymized admin/research analytics.

MindGuard AI is not a medical diagnosis tool. It provides supportive insights only and does not replace therapy, counseling, emergency care, or licensed professional evaluation.

## Run Locally

```bash
npm start
```

Open `http://localhost:4173`.

Demo accounts:

- `user@mindguard.test` / `password123`
- `admin@mindguard.test` / `password123`

## Stack

- Frontend: single-page JavaScript app served from `public/`
- Backend: Node.js HTTP API using built-in modules
- Database: JSON prototype store in `data/mindguard-db.json`
- AI layer: deterministic prototype classifiers for capstone demo
- MCP layer: `mcpOrchestrate()` coordinates text analysis, public post analysis, image/OCR insight, crisis resource lookup, mood history, and explanation output

For production, replace the prototype store and mock models with PostgreSQL, secure JWT/OAuth, FastAPI or NestJS, BERT/RoBERTa text models, OCR, ViT/CNN image models, and a real MCP server.

## Implemented Modules

- Sign up, login, forgot password demo flow, logout
- Role-based user/admin/research dashboard behavior
- User profile and consent controls
- PHQ-9 style screening with Low, Moderate, High output
- Daily mood check-in and trend visualization
- MCP support chatbot with high-risk response handling
- Public post classifier for depressive, anxious, stressed, suicidal-risk, neutral, and non-depressive categories
- Image insight module combining entered OCR text and visual tone
- Crisis resources, coping suggestions, journaling prompts, breathing exercise, activity planner
- Admin/research dashboard with anonymized aggregate analytics and alert list

## API Endpoints

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
GET  /api/auth/me

PATCH /api/users/me

POST /api/screening/phq9
GET  /api/screening/history

POST /api/mood/checkin
GET  /api/mood/trends

POST /api/chat/message
GET  /api/chat/messages

POST /api/analysis/post
POST /api/analysis/image

GET  /api/support/resources
GET  /api/admin/dashboard
```

## MCP Workflow

```text
User input
  -> Backend API
  -> MCP orchestration
  -> Text analysis model
  -> OCR or public post analyzer
  -> Image emotion model when relevant
  -> Mood history database when consented
  -> Crisis resource finder
  -> Explanation engine
  -> Supportive response
```

## Safety and Privacy

- Analyze only user-provided content.
- Do not scrape private accounts or bypass access controls.
- Show disclaimers before and after sensitive insights.
- Escalate high-risk language to crisis resources.
- Use consent controls for mood history, image analysis, research analytics, and high-risk alerts.
- Keep research analytics anonymized.
- In production, encrypt sensitive data at rest and in transit.

## Suggested Production Architecture

```text
Next.js frontend
FastAPI or NestJS backend
PostgreSQL + object storage + vector store
MCP server for tool orchestration
BERT/RoBERTa text classifier
OCR + ViT/CNN image classifier
SHAP/LIME explanation service
Docker + cloud deployment
```

## Roadmap

1. Replace JSON store with PostgreSQL migrations.
2. Add secure password hashing with Argon2 or bcrypt.
3. Add real JWT refresh token rotation or OAuth.
4. Add a production MCP server and external model adapters.
5. Add OCR processing for uploaded screenshots.
6. Add model evaluation metrics, bias audits, and SHAP/LIME reports.
7. Add moderated anonymous support community.
8. Add exportable anonymized research datasets.

#  OrgMind – Organizational Intelligence

OrgMind is an AI-powered organizational intelligence system that allows employees to ask questions about workplace policies and receive relevant answers from the organization's knowledge base.

The system uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant organizational information and **Ollama** to generate responses using a locally running Large Language Model (LLM).

---

## Features

-  AI-powered workplace policy assistant
-  Retrieval-Augmented Generation (RAG)
-  Organization-specific knowledge base
-  Local LLM inference using Ollama
-  Docker-based backend services
-  Web-based frontend
-  REST API for question answering
-  Work-from-home policy queries
-  Leave policy queries
-  Working-hours queries
-  Notice-period queries
-  Recent question history in the UI
-  Modular service-based architecture

---

##  System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Browser  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Frontend       │
                    │   HTML / CSS / JS    │
                    └──────────┬───────────┘
                               │
                         HTTP POST /ask
                               │
                               ▼
                    ┌──────────────────────┐
                    │    App Service       │
                    │      FastAPI         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Retrieval Service    │
                    │                      │
                    │ Vector Search / RAG  │
                    └──────────┬───────────┘
                               │
                         Relevant Context
                               │
                               ▼
                    ┌──────────────────────┐
                    │     LLM Service      │
                    │       Ollama         │
                    └──────────┬───────────┘
                               │
                           AI Response
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Frontend       │
                    │   Display Response   │
                    └──────────────────────┘

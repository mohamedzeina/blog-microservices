# Blog Microservices

A full-stack blog platform built with Node.js, React, and an event-driven microservices architecture. Features a custom-built event bus for inter-service communication, a query service for optimized reads, and a moderation service for comment filtering.

---

## Features

- **Create & view posts** — submit new blog posts and display them in real time
- **Comment on posts** — add comments to any post with per-post comment threads
- **Event-driven architecture** — services communicate asynchronously via a custom event bus
- **Query service** — denormalized read model aggregates posts and comments for fast client queries
- **Comment moderation** — comments are filtered automatically; posts containing "orange" are rejected
- **Event replay** — query service replays all past events on startup to rebuild its state

---

## Architecture

The app is split into six independent services, each with its own Express server:

| Service | Port | Responsibility |
|---|---|---|
| Posts | 4000 | Create and store posts; emit `PostCreated` events |
| Comments | 4001 | Create and store comments; emit `CommentCreated` / `CommentUpdated` events |
| Query | 4002 | Aggregate posts and comments into a single read model |
| Moderation | 4003 | Approve or reject comments; emit `CommentModerated` events |
| Event Bus | 4005 | Receive and fan-out events to all services; store event history |
| Client | 3000 | React frontend |

### Event Flow

```
PostCreate (React)
  └─▶ POST /posts (Posts :4000)
        └─▶ PostCreated ──▶ Event Bus :4005
                                ├──▶ Posts :4000
                                ├──▶ Comments :4001
                                ├──▶ Query :4002
                                └──▶ Moderation :4003

CommentCreate (React)
  └─▶ POST /posts/:id/comments (Comments :4001)
        └─▶ CommentCreated ──▶ Event Bus :4005
                                    ├──▶ Query :4002  (stores comment as "pending")
                                    └──▶ Moderation :4003
                                              └─▶ CommentModerated ──▶ Event Bus :4005
                                                                            └──▶ Comments :4001
                                                                                    └─▶ CommentUpdated ──▶ Event Bus :4005
                                                                                                              └──▶ Query :4002  (updates status to approved/rejected)
```

---

## Tech Stack

### Backend Services
| Technology | Purpose |
|---|---|
| Node.js / Express | HTTP server for each microservice |
| Axios | Inter-service HTTP communication |
| cors | Cross-origin request support |
| nodemon | Auto-restart during development |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Axios | HTTP client |

---

## Project Structure

```
blog-microservices/
├── posts/
│   └── index.js              # Posts service (port 4000)
├── comments/
│   └── index.js              # Comments service (port 4001)
├── query/
│   └── index.js              # Query service (port 4002)
├── moderation/
│   └── index.js              # Moderation service (port 4003)
├── event-bus/
│   └── index.js              # Event bus (port 4005)
└── client/                   # React frontend (port 3000)
    └── src/
        ├── index.js          # React entry point
        ├── App.js            # Root component
        ├── PostCreate.js     # Form for creating posts
        ├── PostList.js       # Displays all posts with comments
        ├── CommentCreate.js  # Form for creating comments
        └── CommentList.js    # Displays comments with moderation status
```

---

## Getting Started

### Prerequisites

- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/mohamedzeina/blog-microservices.git
cd blog-microservices
```

### 2. Install dependencies for each service

```bash
cd posts && npm install && cd ..
cd comments && npm install && cd ..
cd query && npm install && cd ..
cd moderation && npm install && cd ..
cd event-bus && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Start each service in a separate terminal

```bash
cd posts && npm start       # http://localhost:4000
cd comments && npm start    # http://localhost:4001
cd query && npm start       # http://localhost:4002
cd moderation && npm start  # http://localhost:4003
cd event-bus && npm start   # http://localhost:4005
cd client && npm start      # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

### Posts Service (port 4000)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/posts` | Return all posts |
| `POST` | `/posts` | Create a new post |
| `POST` | `/events` | Receive events from the event bus |

### Comments Service (port 4001)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/posts/:id/comments` | Return all comments for a post |
| `POST` | `/posts/:id/comments` | Create a new comment |
| `POST` | `/events` | Receive events from the event bus |

### Query Service (port 4002)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/posts` | Return all posts with their comments |
| `POST` | `/events` | Receive events from the event bus |

### Event Bus (port 4005)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/events` | Accept and fan-out an event to all services |
| `GET` | `/events` | Return all stored events (used for event replay) |

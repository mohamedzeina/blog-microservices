# Blog Microservices

A full-stack blog platform built with Node.js, React, and an event-driven microservices architecture. Features a custom-built event bus for inter-service communication, a query service for optimized reads, a moderation service for comment filtering, and a full Kubernetes deployment with Skaffold for local development.

---

## Features

- **Create & view posts** — submit new blog posts and display them in real time
- **Comment on posts** — add comments to any post with per-post comment threads
- **Event-driven architecture** — services communicate asynchronously via a custom event bus
- **Query service** — denormalized read model aggregates posts and comments for fast client queries
- **Comment moderation** — comments are filtered automatically; comments containing "orange" are rejected
- **Event replay** — query service replays all past events on startup to rebuild its state
- **Kubernetes deployment** — all services run as pods with ClusterIP services and an Nginx Ingress
- **Skaffold** — automatic image rebuilds and pod syncing on file changes during local development

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
  └─▶ POST /posts/create (Posts :4000)
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

### Kubernetes Ingress Routing

All external traffic hits the Nginx Ingress at `http://posts.com` and is routed to the appropriate ClusterIP service:

| Path | Service |
|---|---|
| `/posts/create` | posts-clusterip-srv :4000 |
| `/posts` | query-clusterip-srv :4002 |
| `/posts/:id/comments` | comments-clusterip-srv :4001 |
| `/*` | client-clusterip-srv :3000 |

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

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerise each service |
| Kubernetes | Orchestrate pods, deployments, and services |
| Nginx Ingress | Route external traffic to services |
| Skaffold | Local development workflow — rebuild images and sync files on change |

---

## Project Structure

```
blog-microservices/
├── posts/
│   ├── index.js              # Posts service (port 4000)
│   └── Dockerfile
├── comments/
│   ├── index.js              # Comments service (port 4001)
│   └── Dockerfile
├── query/
│   ├── index.js              # Query service (port 4002)
│   └── Dockerfile
├── moderation/
│   ├── index.js              # Moderation service (port 4003)
│   └── Dockerfile
├── event-bus/
│   ├── index.js              # Event bus (port 4005)
│   └── Dockerfile
├── client/                   # React frontend (port 3000)
│   ├── Dockerfile
│   └── src/
│       ├── index.js          # React entry point
│       ├── App.js            # Root component
│       ├── PostCreate.js     # Form for creating posts
│       ├── PostList.js       # Displays all posts with comments
│       ├── CommentCreate.js  # Form for creating comments
│       └── CommentList.js    # Displays comments with moderation status
├── infra/
│   └── k8s/
│       ├── posts-depl.yaml         # Posts deployment + ClusterIP service
│       ├── comments-depl.yaml      # Comments deployment + ClusterIP service
│       ├── query-depl.yaml         # Query deployment + ClusterIP service
│       ├── moderation-depl.yaml    # Moderation deployment + ClusterIP service
│       ├── event-bus-depl.yaml     # Event bus deployment + ClusterIP service
│       ├── client-depl.yaml        # Client deployment + ClusterIP service
│       ├── posts-srv.yaml          # Posts NodePort service
│       └── ingress-srv.yaml        # Nginx Ingress routing rules
└── skaffold.yaml                   # Skaffold build and sync config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop with Kubernetes enabled
- [Skaffold](https://skaffold.dev/docs/install/)
- [ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/) installed in your cluster
- `posts.com` mapped to `127.0.0.1` in `/etc/hosts`

### 1. Clone the repository

```bash
git clone https://github.com/mohamedzeina/blog-microservices.git
cd blog-microservices
```

### 2. Add hosts entry

Add the following line to `/etc/hosts`:

```
127.0.0.1 posts.com
```

### 3. Start with Skaffold

```bash
skaffold dev
```

Skaffold will build all Docker images, apply the Kubernetes manifests, and sync file changes into running pods automatically.

Open [http://posts.com](http://posts.com).

---

## API Reference

### Posts Service (port 4000)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/posts/create` | Create a new post |
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

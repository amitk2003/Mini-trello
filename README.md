# 📋 MiniTrello — Full-Stack Task Tracker

A clean, production-quality **Task Tracker** built with:

- **Backend**: Java 17 + Spring Boot 3 + Spring Data JPA  
- **Frontend**: React 18 + Vite + Axios  
- **Database**: H2 (dev, in-memory) or MySQL (production)

---

## 🚀 Quick Start

### 1. Backend (Spring Boot)

> **Prerequisites**: Java 17+ must be installed. Maven Wrapper (`mvnw`) is included.

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Backend starts on **http://localhost:8080**  
H2 Console available at **http://localhost:8080/h2-console**

#### Switch to MySQL
1. Edit `src/main/resources/application.properties`
2. Set `spring.profiles.active=mysql`
3. Edit `application-mysql.properties` with your MySQL credentials
4. Create the database: `CREATE DATABASE tasktracker_db;`

---

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install       # (already done if you followed setup)
npm run dev
```

Frontend starts on **http://localhost:3000** (or **http://localhost:5173** if 3000 is occupied)

---

## 📡 REST API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/boards` | Get all boards (ordered) |
| `GET` | `/api/boards/{id}` | Get single board |
| `POST` | `/api/boards` | Create board |
| `PUT` | `/api/boards/{id}` | Update board |
| `DELETE` | `/api/boards/{id}` | Delete board and its tasks |
| `GET` | `/api/tasks` | Get all tasks (optional `?boardId=`, `?status=`, newest first) |
| `GET` | `/api/tasks/stats` | Fast aggregated metrics (pending, in-progress, completed, overdue, total; optional `?boardId=`) |
| `GET` | `/api/tasks/{id}` | Get single task |
| `POST` | `/api/tasks` | Create task (auto-resolves default board if omitted) |
| `PUT` | `/api/tasks/{id}` | Update task |
| `PATCH` | `/api/tasks/{id}/status?status=...` | Fast single-click status transition |
| `DELETE` | `/api/tasks/{id}` | Delete task |
| `GET` | `/api/tasks/search?keyword=...` | Search tasks by title & tags (optional `?boardId=`) |
| `GET` | `/api/activity-logs` | Get audit activity logs (optional `?boardId=`) |

### Sample Task JSON

```json
{
  "title": "Design login page",
  "description": "Create wireframes and implement React components",
  "status": "IN_PROGRESS",
  "dueDate": "2026-05-10T18:00:00"
}
```

Status values: `PENDING` | `IN_PROGRESS` | `COMPLETED`

---

## 🏗️ Project Structure

```
minitrello/
├── backend/
│   ├── src/main/java/com/minitrello/tasktracker/
│   │   ├── TaskTrackerApplication.java      # Entry point
│   │   ├── entity/                        # JPA Entities (Task, Board, ActivityLog)
│   │   ├── repository/                    # Spring Data JPA repositories
│   │   ├── service/                       # Business logic (TaskService, BoardService, etc.)
│   │   │   └── ResourceNotFoundException.java
│   │   └── controller/
│   │       ├── TaskController.java          # Task REST endpoints
│   │       ├── BoardController.java         # Board REST endpoints
│   │       ├── ActivityLogController.java   # Audit log REST endpoints
│   │       └── GlobalExceptionHandler.java  # Error handling
│   └── src/main/resources/
│       ├── application.properties           # H2 config (default)
│       └── application-mysql.properties     # MySQL profile
├── frontend/
│   └── src/
│       ├── api/taskApi.js       # Axios API layer
│       ├── components/
│       │   ├── TaskList.jsx     # Board with filter & search
│       │   ├── TaskList.css
│       │   ├── TaskForm.jsx     # Create/Edit modal
│       │   └── TaskForm.css
│       ├── App.jsx              # Root with header stats
│       ├── App.css
│       └── index.css            # Global design system
└── README.md
```

---

## 🎨 Features

- ✅ **Full CRUD** — Create, Read, Update, Delete tasks and boards
- 🔵 **Status Board** — Pending / In Progress / Completed
- 🗂️ **Boards Support** — Organize tasks into different boards (Backend API)
- 📜 **Activity Logs** — Track operations and changes with an audit trail (Backend API)
- 🔍 **Search** — Filter tasks by keyword and board in real-time
- 📅 **Due Dates** — With overdue highlighting
- 📊 **Live Stats** — Header stats update automatically
- 💎 **Premium UI** — Dark glassmorphism, micro-animations
- 🦴 **Skeleton Loading** — Smooth loading states
- ✅ **Validation** — Both client-side and server-side
- 🗑️ **Delete Confirm** — Safe deletion with confirmation dialog

---

<<<<<<< HEAD
<!-- ## 📝 Resume Description

> Built a full-stack Task Tracker (MiniTrello) using **Spring Boot 3** (REST APIs, Spring Data JPA, H2/MySQL) and **React 18** (Vite, Axios, glassmorphism UI), implementing complete CRUD operations, real-time filtering, and server-side validation. -->
=======

>>>>>>> 19fd81ed1572ae5e5dbbaa3b77e7788e2cc26301

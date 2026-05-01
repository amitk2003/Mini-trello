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

Frontend starts on **http://localhost:5173**

---

## 📡 REST API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/tasks` | Get all tasks |
| `GET` | `/api/tasks?status=PENDING` | Filter by status |
| `GET` | `/api/tasks/{id}` | Get single task |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/{id}` | Update task |
| `DELETE` | `/api/tasks/{id}` | Delete task |
| `GET` | `/api/tasks/search?keyword=...` | Search by title |

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
│   │   ├── entity/Task.java                 # JPA Entity
│   │   ├── repository/TaskRepository.java   # Spring Data JPA
│   │   ├── service/
│   │   │   ├── TaskService.java             # Business logic
│   │   │   └── ResourceNotFoundException.java
│   │   └── controller/
│   │       ├── TaskController.java          # REST endpoints
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

- ✅ **Full CRUD** — Create, Read, Update, Delete tasks
- 🔵 **Status Board** — Pending / In Progress / Completed
- 🔍 **Search** — Filter tasks by keyword in real-time
- 📅 **Due Dates** — With overdue highlighting
- 📊 **Live Stats** — Header stats update automatically
- 💎 **Premium UI** — Dark glassmorphism, micro-animations
- 🦴 **Skeleton Loading** — Smooth loading states
- ✅ **Validation** — Both client-side and server-side
- 🗑️ **Delete Confirm** — Safe deletion with confirmation dialog

---

## 📝 Resume Description

> Built a full-stack Task Tracker (MiniTrello) using **Spring Boot 3** (REST APIs, Spring Data JPA, H2/MySQL) and **React 18** (Vite, Axios, glassmorphism UI), implementing complete CRUD operations, real-time filtering, and server-side validation.

# Mini Project Management System

A full-stack project management application built with Django (backend) and React (frontend), featuring multi-tenant architecture and GraphQL API.

## 🏗️ Architecture Overview

### Backend (Django + GraphQL)
- **Django**: Python web framework (similar to Express.js in Node.js)
- **GraphQL**: Query language for APIs (alternative to REST)
- **PostgreSQL**: Database (similar to MongoDB but relational)
- **Multi-tenancy**: Each organization has isolated data

### Frontend (React + Apollo)
- **React**: UI framework (same as MERN)
- **Apollo Client**: GraphQL client (similar to Axios for REST)
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS framework

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.11+ (for backend development)

### Using Docker (Recommended)
```bash
# Clone and navigate to project
cd task-django

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# GraphQL Playground: http://localhost:8000/graphql/
```

### Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment (like node_modules for Python)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies (same as MERN)
npm install

# Start development server
npm start
```

## Project Structure

```
├── backend/                 # Django backend
│   ├── project_management/  # Main Django project
│   ├── apps/               # Django applications
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Node dependencies
│   └── tailwind.config.js # TailwindCSS config
├── docker-compose.yml    # Docker setup
└── README.md            # This file
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Docker (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up database:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

### Using Docker

1. Start all services:
```bash
docker-compose up -d
```

2. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

## API Documentation

The GraphQL API is available at `http://localhost:8000/graphql/`

### Core Queries
- `organizations`: List all organizations
- `projects(organizationId)`: List projects for an organization
- `tasks(projectId)`: List tasks for a project
- `projectStats(organizationId)`: Get project statistics

### Core Mutations
- `createProject`: Create a new project
- `updateProject`: Update project details
- `createTask`: Create a new task
- `updateTask`: Update task status/details
- `addTaskComment`: Add comment to a task

## Development

### Running Tests

Backend:
```bash
cd backend
python manage.py test
```

Frontend:
```bash
cd frontend
npm test
```

### Code Quality

Backend:
```bash
flake8 .
black .
```

Frontend:
```bash
npm run lint
npm run type-check
```

## Deployment

See deployment documentation in `docs/deployment.md`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

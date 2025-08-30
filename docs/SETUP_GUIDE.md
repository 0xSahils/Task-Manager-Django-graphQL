# Complete Setup Guide

## 🚀 Getting Started (Step by Step)

### Option 1: Docker Setup (Recommended for Demo)

#### Prerequisites
- Install Docker Desktop from https://www.docker.com/products/docker-desktop/
- Make sure Docker is running (you'll see the Docker icon in your system tray)

#### Steps
```bash
# 1. Navigate to project directory
cd "task django"

# 2. Start all services (this will take a few minutes first time)
docker-compose up -d

# 3. Wait for services to start, then check if they're running
docker-compose ps

# 4. Access the applications:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# GraphQL Playground: http://localhost:8000/graphql/
```

#### First Time Setup
```bash
# Create database tables
docker-compose exec backend python manage.py migrate

# Create admin user (optional)
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata sample_data.json
```

### Option 2: Manual Setup (For Development)

#### Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Set up environment variables
copy .env.example .env
# Edit .env file with your database settings

# 6. Run database migrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser

# 8. Start Django server
python manage.py runserver
```

#### Frontend Setup
```bash
# 1. Open new terminal and navigate to frontend
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start React development server
npm start
```

## 🔧 Configuration Files Explained

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:          # PostgreSQL database
    image: postgres:15
    environment:
      POSTGRES_DB: project_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  backend:     # Django API server
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/project_management
  
  frontend:    # React development server
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Backend Configuration
```python
# backend/project_management/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'project_management',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# GraphQL endpoint
GRAPHENE = {
    'SCHEMA': 'project_management.schema.schema'
}

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Frontend Configuration
```javascript
// frontend/src/graphql/client.ts
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
});

// Organization context headers
const authLink = setContext((_, { headers }) => {
  const orgSlug = localStorage.getItem('currentOrganizationSlug');
  return {
    headers: {
      ...headers,
      'X-Organization-Slug': orgSlug,
    },
  };
});
```

## 🐛 Troubleshooting Common Issues

### Docker Issues

#### "docker-compose command not found"
```bash
# Install Docker Desktop, which includes docker-compose
# Or install docker-compose separately:
pip install docker-compose
```

#### "Port already in use"
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process or change ports in docker-compose.yml
```

#### "Database connection failed"
```bash
# Check if database container is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Backend Issues

#### "ModuleNotFoundError: No module named 'django'"
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

#### "django.db.utils.OperationalError: could not connect to server"
```bash
# Check PostgreSQL is running
# If using Docker: docker-compose up db
# If local: start PostgreSQL service

# Check database settings in .env file
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

#### "You have unapplied migrations"
```bash
# Run migrations
python manage.py migrate

# If migration conflicts:
python manage.py makemigrations --merge
python manage.py migrate
```

### Frontend Issues

#### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### "Apollo Client connection error"
```bash
# Check backend is running on port 8000
curl http://localhost:8000/graphql/

# Check CORS settings in Django settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

#### "Organization context missing"
```bash
# In browser console, set organization:
localStorage.setItem('currentOrganizationSlug', 'test-org');
localStorage.setItem('currentOrganizationId', '1');
```

## 📊 Testing the Setup

### Backend Tests
```bash
cd backend
python manage.py test

# Run specific test
python manage.py test apps.organizations.tests

# With coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests
```bash
cd frontend
npm test

# Run all tests
npm test -- --coverage --watchAll=false
```

### GraphQL Playground
1. Go to http://localhost:8000/graphql/
2. Try this query:
```graphql
query {
  organizations {
    edges {
      node {
        id
        name
        slug
      }
    }
  }
}
```

### API Testing with curl
```bash
# Test GraphQL endpoint
curl -X POST http://localhost:8000/graphql/ \
  -H "Content-Type: application/json" \
  -H "X-Organization-Slug: test-org" \
  -d '{"query": "{ organizations { edges { node { name } } } }"}'
```

## 🎯 Demo Preparation Checklist

### Before the Interview:
- [ ] All services start successfully with `docker-compose up -d`
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:8000
- [ ] GraphQL playground works at http://localhost:8000/graphql/
- [ ] Sample data is loaded
- [ ] Tests pass (`python manage.py test` and `npm test`)

### Sample Data Creation:
```bash
# Create sample organization
docker-compose exec backend python manage.py shell
>>> from apps.organizations.models import Organization
>>> org = Organization.objects.create(name="Demo Company", slug="demo-company", contact_email="demo@example.com")
>>> exit()

# Set organization in browser
# Go to http://localhost:3000
# Open browser console and run:
localStorage.setItem('currentOrganizationSlug', 'demo-company');
localStorage.setItem('currentOrganizationId', '1');
```

### Quick Demo Script:
1. **Show Architecture**: Explain multi-tenant GraphQL API
2. **Backend**: Demo GraphQL playground with live queries
3. **Frontend**: Navigate through dashboard, projects, tasks
4. **Code**: Show key files and explain logic
5. **Testing**: Run tests to show quality
6. **Multi-tenancy**: Show data isolation

## 🔍 Monitoring and Logs

### View Logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### Database Access:
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d project_management

# View tables
\dt

# Query data
SELECT * FROM organizations_organization;
```

This setup guide should help you get everything running smoothly for your interview demo!

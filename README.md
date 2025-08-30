# Project Management (Django + React + GraphQL)

A simple project management app with multi-tenant support. Organizations own projects, projects have tasks and comments. Backend exposes a GraphQL API; frontend uses React + Apollo.

## Tech Stack

- **Backend**: Django, Graphene (GraphQL), PostgreSQL
- **Frontend**: React, TypeScript, Apollo Client, TailwindCSS
- **Infra**: Docker Compose (db, backend, frontend)

## Quick Start (Docker)

1. Start services

```powershell
docker compose up -d --build
```

2. Create tables (first time only)

```powershell
docker compose exec backend python manage.py makemigrations organizations projects tasks
docker compose exec backend python manage.py migrate
```

3. Open apps

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- GraphQL: http://localhost:8000/graphql/

4. Create an organization (once)

```powershell
docker compose exec backend python manage.py shell
```

```python
from apps.organizations.models import Organization
org, _ = Organization.objects.get_or_create(
    name="Demo Company", slug="demo-company",
    defaults={"contact_email": "demo@example.com"}
)
print(org.id, org.slug)
```

5. Tell the frontend which org to use (browser console)

```javascript
localStorage.setItem("currentOrganizationSlug", "demo-company");
localStorage.setItem("currentOrganizationId", "<ORG_ID_FROM_PRINT>");
window.location.reload();
```

## Create a Project (GraphQL)

Use GraphQL Playground at http://localhost:8000/graphql/

```graphql
mutation {
  createProject(organizationId: "<ORG_ID>", name: "My First Project") {
    success
    errors
    project {
      id
      name
    }
  }
}
```

## Local Development (without Docker)

Backend

```powershell
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations organizations projects tasks
python manage.py migrate
python manage.py runserver
```

Frontend

```powershell
cd frontend
npm install
npm start
```

## Tests

Backend

```powershell
docker compose exec backend python manage.py test
```

Frontend

```powershell
cd frontend
npm test
```

## Troubleshooting

- "relation 'projects' does not exist" → run `makemigrations` then `migrate`.
- Docker must be running (Docker Desktop). Use `docker version`, `docker compose ps`.
- If compose warns about `version` being obsolete, you can remove that key from docker-compose.yml (optional; harmless).

---

Basic README prepared for GitHub submission. For a deeper explanation, see your private guide in `docs/MY_PROJECT_GUIDE.md` (ignored by Git).

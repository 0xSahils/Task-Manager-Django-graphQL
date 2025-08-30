# MERN Developer's Guide to Django + GraphQL

This guide explains Django and GraphQL concepts from a MERN stack perspective.

## 📚 Key Concepts for MERN Developers

### Django vs Express.js

| Django | Express.js | Purpose |
|--------|------------|---------|
| `models.py` | Mongoose schemas | Data models |
| `views.py` | Route handlers | Business logic |
| `urls.py` | Router | URL routing |
| `settings.py` | Config files | Configuration |
| `manage.py` | npm scripts | CLI commands |
| `migrations/` | Database scripts | Schema changes |
| `admin.py` | Admin panel | Database GUI |

### GraphQL vs REST

**REST (what you know):**
```javascript
// Multiple requests needed
GET /api/projects
GET /api/projects/1/tasks
GET /api/users/1
```

**GraphQL (what we use):**
```graphql
# Single request gets everything
query {
  project(id: "1") {
    name
    tasks {
      title
      assignee {
        email
      }
    }
  }
}
```

### Apollo Client vs Axios

**Axios (REST):**
```javascript
const response = await axios.get('/api/projects');
const projects = response.data;
```

**Apollo Client (GraphQL):**
```javascript
const { data, loading, error } = useQuery(GET_PROJECTS);
const projects = data?.projects;
```

## 🏢 Multi-Tenancy Explained

### What is Multi-Tenancy?
Think of it like Slack workspaces - each organization has its own isolated data, but they all use the same application.

### How it Works in Our App:
1. **Organization Context**: Every request includes organization info in headers
2. **Data Isolation**: Users can only see data from their organization
3. **Shared Infrastructure**: Same database, different data partitions

### Implementation:
```python
# Django Middleware (like Express middleware)
class OrganizationMiddleware:
    def process_request(self, request):
        org_slug = request.META.get('HTTP_X_ORGANIZATION_SLUG')
        request.organization = Organization.objects.get(slug=org_slug)
```

```javascript
// Frontend - Apollo Client automatically adds headers
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

## 📊 Database Schema

### Models Relationship (like Mongoose schemas)

```python
# Organization (like a Slack workspace)
class Organization(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    contact_email = models.EmailField()

# Project (belongs to organization)
class Project(models.Model):
    organization = models.ForeignKey(Organization)  # Like populate() in Mongoose
    name = models.CharField(max_length=200)
    status = models.CharField(choices=STATUS_CHOICES)

# Task (belongs to project)
class Task(models.Model):
    project = models.ForeignKey(Project)
    title = models.CharField(max_length=200)
    status = models.CharField(choices=TASK_STATUS_CHOICES)
    priority = models.CharField(choices=PRIORITY_CHOICES)
```

## 🔧 How the Code Works

### Backend Structure
```
backend/
├── project_management/          # Main Django project (like server.js)
│   ├── settings.py             # Configuration (like .env + config)
│   ├── urls.py                 # Main routing (like app.use())
│   └── schema.py               # GraphQL schema root
├── apps/                       # Feature modules (like routes/)
│   ├── organizations/          # Organization management
│   ├── projects/              # Project management
│   └── tasks/                 # Task management
└── manage.py                  # CLI tool (like npm scripts)
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                # Page components (like views)
│   ├── graphql/              # GraphQL queries & mutations
│   ├── types/                # TypeScript interfaces
│   └── utils/                # Helper functions
├── public/                   # Static files
└── package.json             # Dependencies (same as MERN)
```

### GraphQL Schema Example
```python
# Django GraphQL (like defining API endpoints)
class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = '__all__'

class Query(graphene.ObjectType):
    projects = graphene.List(ProjectType)
    
    def resolve_projects(self, info):
        # Like a route handler in Express
        return Project.objects.filter(
            organization=info.context.organization
        )
```

### React Component with Apollo
```typescript
// Like using useState + useEffect + axios
const Projects: React.FC = () => {
  const { data, loading, error } = useQuery(GET_PROJECTS);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  const projects = data?.projectsByOrganization || [];
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

## 🔐 Authentication & Authorization

### How it Works:
1. **Organization Selection**: User selects organization (stored in localStorage)
2. **Request Headers**: Every API call includes organization context
3. **Server Validation**: Django middleware validates organization access
4. **Data Filtering**: All queries automatically filter by organization

### Code Example:
```python
# Django - Automatic data filtering
def resolve_projects(self, info):
    organization = info.context.organization  # From middleware
    return Project.objects.filter(organization=organization)
```

```javascript
// React - Organization context
const { currentOrganization } = useOrganizationContext();
// All GraphQL queries automatically use this context
```

## 🐳 Docker Explained

### What is Docker?
Think of Docker like a virtual machine, but lighter. It packages your app with all its dependencies.

### Our Docker Setup:
```yaml
# docker-compose.yml - like package.json for services
services:
  db:          # PostgreSQL database
  backend:     # Django API server
  frontend:    # React development server
```

### Why Docker?
- **Consistency**: Same environment everywhere
- **Easy Setup**: One command starts everything
- **Isolation**: Services don't interfere with each other

## 🧪 Testing

### Backend Tests (Django)
```bash
cd backend
python manage.py test
```

### Frontend Tests (React)
```bash
cd frontend
npm test
```

### Test Structure:
```python
# Django tests (like Jest for Node.js)
class ProjectModelTest(TestCase):
    def test_create_project(self):
        project = Project.objects.create(name="Test")
        self.assertEqual(project.name, "Test")
```

## 🚀 Deployment

### Production Checklist:
1. Set environment variables
2. Run database migrations
3. Collect static files (Django)
4. Build React app
5. Configure reverse proxy (Nginx)

### Environment Variables:
```bash
# Backend (.env)
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://...

# Frontend (.env)
REACT_APP_GRAPHQL_URL=https://api.yourapp.com/graphql/
```

## 📈 Performance Considerations

### Backend Optimizations:
- **Database Indexing**: Fast queries
- **Query Optimization**: Reduce N+1 problems
- **Caching**: Redis for frequent data

### Frontend Optimizations:
- **Code Splitting**: Lazy load components
- **Apollo Caching**: Automatic query caching
- **Image Optimization**: Compressed assets

## 🔍 Debugging Tips

### Backend Debugging:
```python
# Add print statements (like console.log)
print(f"Organization: {request.organization}")

# Use Django shell (like Node REPL)
python manage.py shell
```

### Frontend Debugging:
```javascript
// Apollo DevTools (like Redux DevTools)
// GraphQL queries visible in browser
console.log('Apollo Client:', apolloClient);
```

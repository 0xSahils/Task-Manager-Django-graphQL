# API Documentation

## GraphQL API

The project management system uses GraphQL for its API layer. The GraphQL endpoint is available at `/graphql/` and includes an interactive GraphiQL interface for development.

### Authentication & Organization Context

All API requests require organization context to be provided via headers:

```
X-Organization-Slug: your-org-slug
# OR
X-Organization-ID: your-org-id
```

### Core Types

#### Organization
```graphql
type Organization {
  id: ID!
  name: String!
  slug: String!
  contactEmail: String!
  description: String
  isActive: Boolean!
  projectCount: Int!
  activeProjectCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### Project
```graphql
type Project {
  id: ID!
  name: String!
  description: String
  status: ProjectStatus!
  dueDate: Date
  taskCount: Int!
  completedTasks: Int!
  completionRate: Float!
  isOverdue: Boolean!
  organization: Organization!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
  CANCELLED
}
```

#### Task
```graphql
type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  assigneeEmail: String
  dueDate: DateTime
  isOverdue: Boolean!
  commentCount: Int!
  project: Project!
  comments: [TaskComment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### TaskComment
```graphql
type TaskComment {
  id: ID!
  content: String!
  authorEmail: String!
  task: Task!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Queries

#### Organizations
```graphql
# Get all organizations
query GetOrganizations {
  organizations {
    edges {
      node {
        id
        name
        slug
        contactEmail
        projectCount
      }
    }
  }
}

# Get organization by ID
query GetOrganization($id: ID!) {
  organization(id: $id) {
    id
    name
    slug
    contactEmail
    description
    projectCount
    activeProjectCount
  }
}

# Get organization by slug
query GetOrganizationBySlug($slug: String!) {
  organizationBySlug(slug: $slug) {
    id
    name
    slug
    contactEmail
  }
}
```

#### Projects
```graphql
# Get projects for current organization
query GetProjectsByOrganization {
  projectsByOrganization {
    id
    name
    description
    status
    taskCount
    completedTasks
    completionRate
    dueDate
  }
}

# Get project by ID
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    description
    status
    taskCount
    completedTasks
    completionRate
    organization {
      name
    }
  }
}

# Get project statistics
query GetProjectStats {
  projectStats {
    totalProjects
    activeProjects
    completedProjects
    overdueProjects
    totalTasks
    completedTasks
    overallCompletionRate
  }
}
```

#### Tasks
```graphql
# Get tasks by project
query GetTasksByProject($projectId: ID!) {
  tasksByProject(projectId: $projectId) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    isOverdue
    commentCount
  }
}

# Get task with comments
query GetTask($id: ID!) {
  task(id: $id) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    project {
      name
    }
    comments {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

### Mutations

#### Organizations
```graphql
# Create organization
mutation CreateOrganization($name: String!, $contactEmail: String!) {
  createOrganization(name: $name, contactEmail: $contactEmail) {
    success
    errors
    organization {
      id
      name
      slug
    }
  }
}

# Update organization
mutation UpdateOrganization($id: ID!, $name: String) {
  updateOrganization(id: $id, name: $name) {
    success
    errors
    organization {
      id
      name
      slug
    }
  }
}
```

#### Projects
```graphql
# Create project
mutation CreateProject($organizationId: ID!, $name: String!, $description: String) {
  createProject(organizationId: $organizationId, name: $name, description: $description) {
    success
    errors
    project {
      id
      name
      description
      status
    }
  }
}

# Update project
mutation UpdateProject($id: ID!, $status: String) {
  updateProject(id: $id, status: $status) {
    success
    errors
    project {
      id
      status
    }
  }
}
```

#### Tasks
```graphql
# Create task
mutation CreateTask($projectId: ID!, $title: String!, $description: String) {
  createTask(projectId: $projectId, title: $title, description: $description) {
    success
    errors
    task {
      id
      title
      status
      priority
    }
  }
}

# Update task
mutation UpdateTask($id: ID!, $status: String) {
  updateTask(id: $id, status: $status) {
    success
    errors
    task {
      id
      status
    }
  }
}

# Add task comment
mutation AddTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
  addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
    success
    errors
    comment {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

### Error Handling

All mutations return a standardized response format:

```graphql
type MutationResponse {
  success: Boolean!
  errors: [String!]!
}
```

Common error scenarios:
- **Organization context missing**: Ensure `X-Organization-Slug` or `X-Organization-ID` header is provided
- **Access denied**: User doesn't have permission to access the requested resource
- **Validation errors**: Input data doesn't meet validation requirements
- **Not found**: Requested resource doesn't exist

### Rate Limiting

The API implements rate limiting to prevent abuse:
- 1000 requests per hour per IP address
- 100 mutations per hour per organization

### Pagination

List queries support cursor-based pagination:

```graphql
query GetProjects($first: Int, $after: String) {
  projects(first: $first, after: $after) {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

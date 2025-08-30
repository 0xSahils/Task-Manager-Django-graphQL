import { gql } from '@apollo/client';

// Organization Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $contactEmail: String!, $description: String, $slug: String) {
    createOrganization(name: $name, contactEmail: $contactEmail, description: $description, slug: $slug) {
      success
      errors
      organization {
        id
        name
        slug
        contactEmail
        description
        isActive
        projectCount
        activeProjectCount
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $name: String, $contactEmail: String, $description: String, $isActive: Boolean) {
    updateOrganization(id: $id, name: $name, contactEmail: $contactEmail, description: $description, isActive: $isActive) {
      success
      errors
      organization {
        id
        name
        slug
        contactEmail
        description
        isActive
        projectCount
        activeProjectCount
        createdAt
        updatedAt
      }
    }
  }
`;

// Project Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($organizationId: ID!, $name: String!, $description: String, $status: String, $dueDate: Date) {
    createProject(organizationId: $organizationId, name: $name, description: $description, status: $status, dueDate: $dueDate) {
      success
      errors
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTasks
        completionRate
        isOverdue
        organization {
          id
          name
          slug
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $name: String, $description: String, $status: String, $dueDate: Date) {
    updateProject(id: $id, name: $name, description: $description, status: $status, dueDate: $dueDate) {
      success
      errors
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTasks
        completionRate
        isOverdue
        organization {
          id
          name
          slug
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// Task Mutations
export const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!, $description: String, $status: String, $priority: String, $assigneeEmail: String, $dueDate: DateTime) {
    createTask(projectId: $projectId, title: $title, description: $description, status: $status, priority: $priority, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      success
      errors
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        dueDate
        isOverdue
        commentCount
        project {
          id
          name
          organization {
            id
            name
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: String, $priority: String, $assigneeEmail: String, $dueDate: DateTime) {
    updateTask(id: $id, title: $title, description: $description, status: $status, priority: $priority, assigneeEmail: $assigneeEmail, dueDate: $dueDate) {
      success
      errors
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        dueDate
        isOverdue
        commentCount
        project {
          id
          name
          organization {
            id
            name
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// Task Comment Mutations
export const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
    addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
      success
      errors
      comment {
        id
        content
        authorEmail
        task {
          id
          title
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// Optimistic Response Helpers
export const createOptimisticProject = (input: any) => ({
  __typename: 'Project',
  id: 'temp-' + Date.now(),
  name: input.name,
  description: input.description || '',
  status: input.status || 'ACTIVE',
  dueDate: input.dueDate || null,
  taskCount: 0,
  completedTasks: 0,
  completionRate: 0,
  isOverdue: false,
  organization: {
    __typename: 'Organization',
    id: input.organizationId,
    name: '',
    slug: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createOptimisticTask = (input: any) => ({
  __typename: 'Task',
  id: 'temp-' + Date.now(),
  title: input.title,
  description: input.description || '',
  status: input.status || 'TODO',
  priority: input.priority || 'MEDIUM',
  assigneeEmail: input.assigneeEmail || '',
  dueDate: input.dueDate || null,
  isOverdue: false,
  commentCount: 0,
  project: {
    __typename: 'Project',
    id: input.projectId,
    name: '',
    organization: {
      __typename: 'Organization',
      id: '',
      name: '',
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createOptimisticComment = (input: any) => ({
  __typename: 'TaskComment',
  id: 'temp-' + Date.now(),
  content: input.content,
  authorEmail: input.authorEmail,
  task: {
    __typename: 'Task',
    id: input.taskId,
    title: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

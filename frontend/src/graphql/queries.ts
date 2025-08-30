import { gql } from '@apollo/client';

// Organization Queries
export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
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
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
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
`;

export const GET_ORGANIZATION_BY_SLUG = gql`
  query GetOrganizationBySlug($slug: String!) {
    organizationBySlug(slug: $slug) {
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
`;

// Project Queries
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
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
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
`;

export const GET_PROJECTS_BY_ORGANIZATION = gql`
  query GetProjectsByOrganization($organizationId: ID) {
    projectsByOrganization(organizationId: $organizationId) {
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
`;

export const GET_PROJECT_STATS = gql`
  query GetProjectStats($organizationId: ID) {
    projectStats(organizationId: $organizationId) {
      totalProjects
      activeProjects
      completedProjects
      overdueProjects
      totalTasks
      completedTasks
      overallCompletionRate
    }
  }
`;

// Task Queries
export const GET_TASKS = gql`
  query GetTasks {
    tasks {
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
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
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
      comments {
        id
        content
        authorEmail
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASKS_BY_PROJECT = gql`
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
      project {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

// Task Comment Queries
export const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: ID!) {
    taskComments(taskId: $taskId) {
      id
      content
      authorEmail
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK_COMMENT = gql`
  query GetTaskComment($id: ID!) {
    taskComment(id: $id) {
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
`;

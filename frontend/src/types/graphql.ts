// GraphQL-specific types for Apollo Client

import { 
  Organization, 
  Project, 
  Task, 
  TaskComment, 
  ProjectStats,
  Connection,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskCommentInput
} from './index';

// Query Variables
export interface GetOrganizationVariables {
  id: string;
}

export interface GetOrganizationBySlugVariables {
  slug: string;
}

export interface GetProjectVariables {
  id: string;
}

export interface GetProjectsByOrganizationVariables {
  organizationId?: string;
}

export interface GetProjectStatsVariables {
  organizationId?: string;
}

export interface GetTaskVariables {
  id: string;
}

export interface GetTasksByProjectVariables {
  projectId: string;
}

export interface GetTaskCommentsVariables {
  taskId: string;
}

// Query Response Types
export interface GetOrganizationQuery {
  organization?: Organization;
}

export interface GetOrganizationsQuery {
  organizations: Connection<Organization>;
}

export interface GetOrganizationBySlugQuery {
  organizationBySlug?: Organization;
}

export interface GetProjectQuery {
  project?: Project;
}

export interface GetProjectsQuery {
  projects: Connection<Project>;
}

export interface GetProjectsByOrganizationQuery {
  projectsByOrganization: Project[];
}

export interface GetProjectStatsQuery {
  projectStats?: ProjectStats;
}

export interface GetTaskQuery {
  task?: Task;
}

export interface GetTasksQuery {
  tasks: Connection<Task>;
}

export interface GetTasksByProjectQuery {
  tasksByProject: Task[];
}

export interface GetTaskCommentQuery {
  taskComment?: TaskComment;
}

export interface GetTaskCommentsQuery {
  taskComments: TaskComment[];
}

// Mutation Variables
export interface CreateOrganizationVariables {
  input: CreateOrganizationInput;
}

export interface UpdateOrganizationVariables {
  input: UpdateOrganizationInput;
}

export interface CreateProjectVariables {
  input: CreateProjectInput;
}

export interface UpdateProjectVariables {
  input: UpdateProjectInput;
}

export interface CreateTaskVariables {
  input: CreateTaskInput;
}

export interface UpdateTaskVariables {
  input: UpdateTaskInput;
}

export interface CreateTaskCommentVariables {
  input: CreateTaskCommentInput;
}

// Mutation Response Types
export interface CreateOrganizationMutation {
  createOrganization: {
    success: boolean;
    errors: string[];
    organization?: Organization;
  };
}

export interface UpdateOrganizationMutation {
  updateOrganization: {
    success: boolean;
    errors: string[];
    organization?: Organization;
  };
}

export interface CreateProjectMutation {
  createProject: {
    success: boolean;
    errors: string[];
    project?: Project;
  };
}

export interface UpdateProjectMutation {
  updateProject: {
    success: boolean;
    errors: string[];
    project?: Project;
  };
}

export interface CreateTaskMutation {
  createTask: {
    success: boolean;
    errors: string[];
    task?: Task;
  };
}

export interface UpdateTaskMutation {
  updateTask: {
    success: boolean;
    errors: string[];
    task?: Task;
  };
}

export interface CreateTaskCommentMutation {
  addTaskComment: {
    success: boolean;
    errors: string[];
    comment?: TaskComment;
  };
}

// Apollo Client Cache Types
export interface CacheConfig {
  typePolicies: {
    [typename: string]: {
      fields?: {
        [fieldName: string]: any;
      };
      keyFields?: string[] | false;
    };
  };
}

// Error Types
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

export interface NetworkError {
  name: string;
  message: string;
  stack?: string;
  networkError?: any;
}

// Subscription Types (for future real-time features)
export interface TaskUpdatedSubscription {
  taskUpdated: Task;
}

export interface ProjectUpdatedSubscription {
  projectUpdated: Project;
}

export interface CommentAddedSubscription {
  commentAdded: TaskComment;
}

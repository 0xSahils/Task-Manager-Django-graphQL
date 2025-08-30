// Base types
export type ID = string;

// Organization types
export interface Organization {
  id: ID;
  name: string;
  slug: string;
  contactEmail: string;
  description?: string;
  isActive: boolean;
  projectCount: number;
  activeProjectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  contactEmail: string;
  description?: string;
  slug?: string;
}

export interface UpdateOrganizationInput {
  id: ID;
  name?: string;
  contactEmail?: string;
  description?: string;
  isActive?: boolean;
}

// Project types
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export interface Project {
  id: ID;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: string;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
  isOverdue: boolean;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  organizationId: ID;
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface UpdateProjectInput {
  id: ID;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
}

// Task types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
  isOverdue: boolean;
  commentCount: number;
  project: Project;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: ID;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  id: ID;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

// Task Comment types
export interface TaskComment {
  id: ID;
  content: string;
  authorEmail: string;
  task: Task;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskCommentInput {
  taskId: ID;
  content: string;
  authorEmail: string;
}

// API Response types
export interface MutationResponse {
  success: boolean;
  errors: string[];
}

export interface CreateOrganizationResponse extends MutationResponse {
  organization?: Organization;
}

export interface UpdateOrganizationResponse extends MutationResponse {
  organization?: Organization;
}

export interface CreateProjectResponse extends MutationResponse {
  project?: Project;
}

export interface UpdateProjectResponse extends MutationResponse {
  project?: Project;
}

export interface CreateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface UpdateTaskResponse extends MutationResponse {
  task?: Task;
}

export interface CreateTaskCommentResponse extends MutationResponse {
  comment?: TaskComment;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: PaginationInfo;
}

// Form types
export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Filter and Sort types
export interface ProjectFilters {
  status?: ProjectStatus[];
  organizationId?: ID;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: ID;
  assigneeEmail?: string;
  search?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}

// Context types
export interface OrganizationContextType {
  currentOrganization?: Organization;
  setCurrentOrganization: (org: Organization | undefined) => void;
  organizations: Organization[];
  loading: boolean;
  error?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

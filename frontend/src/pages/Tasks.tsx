import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { PlusIcon, ViewColumnsIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { GET_TASKS, GET_PROJECTS_BY_ORGANIZATION } from '../graphql/queries';
import { Task, TaskStatus, TaskPriority, Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskBoard from '../components/TaskBoard';
import TaskList from '../components/TaskList';
import CreateTaskModal from '../components/CreateTaskModal';

type ViewMode = 'board' | 'list';

const Tasks: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const { data: tasksData, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery(GET_TASKS);
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(GET_PROJECTS_BY_ORGANIZATION);

  if (tasksLoading || projectsLoading) {
    return <LoadingSpinner />;
  }

  if (tasksError || projectsError) {
    return <ErrorMessage 
      message={tasksError?.message || projectsError?.message || 'An error occurred'} 
      onRetry={() => {
        refetchTasks();
      }} 
    />;
  }

  const tasks: Task[] = tasksData?.tasks?.edges?.map((edge: any) => edge.node) || [];
  const projects: Project[] = projectsData?.projectsByOrganization || [];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesProject = selectedProject === 'ALL' || task.project.id === selectedProject;
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesProject && matchesStatus && matchesPriority;
  });

  const statusOptions: Array<{ value: TaskStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const priorityOptions: Array<{ value: TaskPriority | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your tasks
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'board'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Project Filter */}
          <div>
            <label className="form-label">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="form-input"
            >
              <option value="ALL">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
              className="form-input"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="form-label">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
              className="form-input"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Task View */}
      {viewMode === 'board' ? (
        <TaskBoard tasks={filteredTasks} onTaskUpdate={refetchTasks} />
      ) : (
        <TaskList tasks={filteredTasks} onTaskUpdate={refetchTasks} />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetchTasks();
        }}
        projects={projects}
      />
    </div>
  );
};

export default Tasks;

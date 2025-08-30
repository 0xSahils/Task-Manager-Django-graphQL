import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PROJECT, GET_TASKS_BY_PROJECT } from '../graphql/queries';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskBoard from '../components/TaskBoard';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: projectData, loading: projectLoading, error: projectError } = useQuery(GET_PROJECT, {
    variables: { id },
    skip: !id,
  });

  const { data: tasksData, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery(GET_TASKS_BY_PROJECT, {
    variables: { projectId: id },
    skip: !id,
  });

  if (projectLoading || tasksLoading) {
    return <LoadingSpinner />;
  }

  if (projectError || tasksError) {
    return <ErrorMessage message={projectError?.message || tasksError?.message || 'An error occurred'} />;
  }

  const project: Project = projectData?.project;
  const tasks: Task[] = tasksData?.tasksByProject || [];

  if (!project) {
    return <ErrorMessage message="Project not found" />;
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="ml-6 flex items-center space-x-4">
            <span className={`status-${project.status.toLowerCase()}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{project.taskCount}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{project.completedTasks}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{project.completionRate.toFixed(0)}%</div>
            <div className="text-sm text-gray-500">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks</h2>
        <TaskBoard tasks={tasks} onTaskUpdate={refetchTasks} />
      </div>
    </div>
  );
};

export default ProjectDetail;

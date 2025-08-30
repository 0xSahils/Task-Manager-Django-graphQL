import React from 'react';
import { useQuery } from '@apollo/client';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { GET_PROJECT_STATS, GET_PROJECTS } from '../graphql/queries';
import { ProjectStats, Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProjectCard from '../components/ProjectCard';

const Dashboard: React.FC = () => {
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_PROJECT_STATS);
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(GET_PROJECTS);

  if (statsLoading || projectsLoading) {
    return <LoadingSpinner />;
  }

  if (statsError || projectsError) {
    return <ErrorMessage message={statsError?.message || projectsError?.message || 'An error occurred'} />;
  }

  const stats: ProjectStats = statsData?.projectStats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overallCompletionRate: 0,
  };

  const projects: Project[] = projectsData?.projects || [];
  const recentProjects = projects.slice(0, 6); // Show 6 most recent projects

  const statCards = [
    {
      name: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      icon: ClipboardDocumentListIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Completed Projects',
      value: stats.completedProjects,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Overdue Projects',
      value: stats.overdueProjects,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your projects and tasks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.name} className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Task Completion</span>
              <span>{stats.overallCompletionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.overallCompletionRate}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Tasks:</span>
              <span className="ml-2 font-medium">{stats.totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-500">Completed:</span>
              <span className="ml-2 font-medium">{stats.completedTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
          <a
            href="/projects"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View all projects →
          </a>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new project.
            </p>
            <div className="mt-6">
              <a
                href="/projects"
                className="btn-primary"
              >
                Create Project
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

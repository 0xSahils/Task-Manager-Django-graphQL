import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Project } from '../types';
import { formatDate } from '../utils/dateUtils';
import { clsx } from 'clsx';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className = '' }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'ON_HOLD':
        return 'status-on-hold';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      case 'ON_HOLD':
        return 'On Hold';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className={clsx('card hover:shadow-md transition-shadow duration-200', className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/projects/${project.id}`}
              className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={getStatusBadgeClass(project.status)}>
              {getStatusText(project.status)}
            </span>
            {project.isOverdue && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Overdue" />
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{project.completionRate.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-300',
                project.completionRate === 100 
                  ? 'bg-green-500' 
                  : 'bg-primary-600'
              )}
              style={{ width: `${project.completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
            <span>{project.completedTasks}/{project.taskCount} tasks</span>
          </div>
          {project.dueDate && (
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className={clsx(
                project.isOverdue && project.status !== 'COMPLETED' 
                  ? 'text-red-600 font-medium' 
                  : ''
              )}>
                {formatDate(project.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Updated {formatDate(project.updatedAt, 'relative')}
            </span>
            <Link
              to={`/projects/${project.id}`}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

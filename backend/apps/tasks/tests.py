from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from .models import Task, TaskComment
from apps.projects.models import Project
from apps.organizations.models import Organization


class TaskModelTest(TestCase):
    """Test cases for Task model."""

    def setUp(self):
        """Set up test data."""
        self.organization = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.organization,
            name='Test Project'
        )
        self.task_data = {
            'project': self.project,
            'title': 'Test Task',
            'description': 'A test task',
            'status': 'TODO',
            'priority': 'MEDIUM',
            'assignee_email': 'assignee@example.com',
            'due_date': timezone.now() + timedelta(days=7)
        }

    def test_create_task(self):
        """Test creating a task."""
        task = Task.objects.create(**self.task_data)
        
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.project, self.project)
        self.assertEqual(task.status, 'TODO')
        self.assertEqual(task.priority, 'MEDIUM')
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_task_str_representation(self):
        """Test string representation of task."""
        task = Task.objects.create(**self.task_data)
        expected_str = f"{self.project.name} - {task.title}"
        self.assertEqual(str(task), expected_str)

    def test_organization_property(self):
        """Test organization property."""
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.organization, self.organization)

    def test_is_overdue_property_not_overdue(self):
        """Test is_overdue property when task is not overdue."""
        task = Task.objects.create(**self.task_data)
        self.assertFalse(task.is_overdue)

    def test_is_overdue_property_overdue(self):
        """Test is_overdue property when task is overdue."""
        self.task_data['due_date'] = timezone.now() - timedelta(days=1)
        task = Task.objects.create(**self.task_data)
        self.assertTrue(task.is_overdue)

    def test_is_overdue_property_completed(self):
        """Test is_overdue property when task is completed."""
        self.task_data['due_date'] = timezone.now() - timedelta(days=1)
        self.task_data['status'] = 'DONE'
        task = Task.objects.create(**self.task_data)
        self.assertFalse(task.is_overdue)

    def test_is_overdue_property_no_due_date(self):
        """Test is_overdue property when task has no due date."""
        self.task_data['due_date'] = None
        task = Task.objects.create(**self.task_data)
        self.assertFalse(task.is_overdue)

    def test_comment_count_property(self):
        """Test comment_count property."""
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.comment_count, 0)

    def test_status_choices(self):
        """Test valid status choices."""
        valid_statuses = ['TODO', 'IN_PROGRESS', 'DONE']
        
        for status in valid_statuses:
            self.task_data['status'] = status
            task = Task.objects.create(**self.task_data)
            self.assertEqual(task.status, status)
            task.delete()  # Clean up for next iteration

    def test_priority_choices(self):
        """Test valid priority choices."""
        valid_priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        
        for priority in valid_priorities:
            self.task_data['priority'] = priority
            task = Task.objects.create(**self.task_data)
            self.assertEqual(task.priority, priority)
            task.delete()  # Clean up for next iteration

    def test_default_values(self):
        """Test default values."""
        minimal_task = Task.objects.create(
            project=self.project,
            title='Minimal Task'
        )
        
        self.assertEqual(minimal_task.status, 'TODO')
        self.assertEqual(minimal_task.priority, 'MEDIUM')
        self.assertEqual(minimal_task.description, '')
        self.assertEqual(minimal_task.assignee_email, '')

    def test_invalid_email(self):
        """Test validation of assignee email."""
        self.task_data['assignee_email'] = 'invalid-email'
        task = Task(**self.task_data)
        
        with self.assertRaises(ValidationError):
            task.full_clean()


class TaskCommentModelTest(TestCase):
    """Test cases for TaskComment model."""

    def setUp(self):
        """Set up test data."""
        self.organization = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.organization,
            name='Test Project'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.comment_data = {
            'task': self.task,
            'content': 'This is a test comment',
            'author_email': 'author@example.com'
        }

    def test_create_comment(self):
        """Test creating a comment."""
        comment = TaskComment.objects.create(**self.comment_data)
        
        self.assertEqual(comment.content, 'This is a test comment')
        self.assertEqual(comment.task, self.task)
        self.assertEqual(comment.author_email, 'author@example.com')
        self.assertIsNotNone(comment.created_at)
        self.assertIsNotNone(comment.updated_at)

    def test_comment_str_representation(self):
        """Test string representation of comment."""
        comment = TaskComment.objects.create(**self.comment_data)
        expected_str = f"Comment on {self.task.title} by {comment.author_email}"
        self.assertEqual(str(comment), expected_str)

    def test_organization_property(self):
        """Test organization property."""
        comment = TaskComment.objects.create(**self.comment_data)
        self.assertEqual(comment.organization, self.organization)

    def test_invalid_email(self):
        """Test validation of author email."""
        self.comment_data['author_email'] = 'invalid-email'
        comment = TaskComment(**self.comment_data)
        
        with self.assertRaises(ValidationError):
            comment.full_clean()


class TaskQuerySetTest(TestCase):
    """Test cases for Task and TaskComment querysets."""

    def setUp(self):
        """Set up test data."""
        self.org1 = Organization.objects.create(
            name='Org 1',
            contact_email='org1@example.com'
        )
        self.org2 = Organization.objects.create(
            name='Org 2',
            contact_email='org2@example.com'
        )
        
        self.project1 = Project.objects.create(
            organization=self.org1,
            name='Project 1'
        )
        self.project2 = Project.objects.create(
            organization=self.org2,
            name='Project 2'
        )
        
        self.task1 = Task.objects.create(
            project=self.project1,
            title='Task 1',
            status='TODO'
        )
        self.task2 = Task.objects.create(
            project=self.project2,
            title='Task 2',
            status='DONE'
        )

    def test_filter_tasks_by_project(self):
        """Test filtering tasks by project."""
        project1_tasks = Task.objects.filter(project=self.project1)
        self.assertEqual(project1_tasks.count(), 1)
        self.assertEqual(project1_tasks.first(), self.task1)

    def test_filter_tasks_by_organization(self):
        """Test filtering tasks by organization."""
        org1_tasks = Task.objects.filter(project__organization=self.org1)
        self.assertEqual(org1_tasks.count(), 1)
        self.assertEqual(org1_tasks.first(), self.task1)

    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status."""
        todo_tasks = Task.objects.filter(status='TODO')
        self.assertEqual(todo_tasks.count(), 1)
        self.assertEqual(todo_tasks.first(), self.task1)

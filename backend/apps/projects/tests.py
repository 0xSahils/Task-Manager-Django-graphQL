from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from datetime import date, timedelta
from .models import Project
from apps.organizations.models import Organization


class ProjectModelTest(TestCase):
    """Test cases for Project model."""

    def setUp(self):
        """Set up test data."""
        self.organization = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project_data = {
            'organization': self.organization,
            'name': 'Test Project',
            'description': 'A test project',
            'status': 'ACTIVE',
            'due_date': date.today() + timedelta(days=30)
        }

    def test_create_project(self):
        """Test creating a project."""
        project = Project.objects.create(**self.project_data)
        
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.organization, self.organization)
        self.assertEqual(project.status, 'ACTIVE')
        self.assertIsNotNone(project.created_at)
        self.assertIsNotNone(project.updated_at)

    def test_project_str_representation(self):
        """Test string representation of project."""
        project = Project.objects.create(**self.project_data)
        expected_str = f"{self.organization.name} - {project.name}"
        self.assertEqual(str(project), expected_str)

    def test_unique_together_constraint(self):
        """Test that organization + name must be unique."""
        Project.objects.create(**self.project_data)
        
        # Try to create another project with same name in same organization
        with self.assertRaises(IntegrityError):
            Project.objects.create(**self.project_data)

    def test_different_organizations_same_name(self):
        """Test that projects can have same name in different organizations."""
        Project.objects.create(**self.project_data)
        
        # Create another organization
        other_org = Organization.objects.create(
            name='Other Org',
            contact_email='other@example.com'
        )
        
        # Should be able to create project with same name in different org
        other_project = Project.objects.create(
            organization=other_org,
            name='Test Project',
            description='Another test project'
        )
        
        self.assertEqual(other_project.name, 'Test Project')
        self.assertEqual(other_project.organization, other_org)

    def test_task_count_property(self):
        """Test task_count property."""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.task_count, 0)

    def test_completed_tasks_property(self):
        """Test completed_tasks property."""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.completed_tasks, 0)

    def test_completion_rate_property(self):
        """Test completion_rate property."""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.completion_rate, 0)

    def test_is_overdue_property_not_overdue(self):
        """Test is_overdue property when project is not overdue."""
        project = Project.objects.create(**self.project_data)
        self.assertFalse(project.is_overdue)

    def test_is_overdue_property_overdue(self):
        """Test is_overdue property when project is overdue."""
        self.project_data['due_date'] = date.today() - timedelta(days=1)
        project = Project.objects.create(**self.project_data)
        self.assertTrue(project.is_overdue)

    def test_is_overdue_property_completed(self):
        """Test is_overdue property when project is completed."""
        self.project_data['due_date'] = date.today() - timedelta(days=1)
        self.project_data['status'] = 'COMPLETED'
        project = Project.objects.create(**self.project_data)
        self.assertFalse(project.is_overdue)

    def test_is_overdue_property_no_due_date(self):
        """Test is_overdue property when project has no due date."""
        self.project_data['due_date'] = None
        project = Project.objects.create(**self.project_data)
        self.assertFalse(project.is_overdue)

    def test_status_choices(self):
        """Test valid status choices."""
        valid_statuses = ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']
        
        for status in valid_statuses:
            self.project_data['status'] = status
            project = Project.objects.create(**self.project_data)
            self.assertEqual(project.status, status)
            project.delete()  # Clean up for next iteration

    def test_default_status(self):
        """Test default status is ACTIVE."""
        del self.project_data['status']
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.status, 'ACTIVE')


class ProjectQuerySetTest(TestCase):
    """Test cases for Project querysets."""

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
            name='Project 1',
            status='ACTIVE'
        )
        self.project2 = Project.objects.create(
            organization=self.org2,
            name='Project 2',
            status='COMPLETED'
        )

    def test_filter_by_organization(self):
        """Test filtering projects by organization."""
        org1_projects = Project.objects.filter(organization=self.org1)
        self.assertEqual(org1_projects.count(), 1)
        self.assertEqual(org1_projects.first(), self.project1)

    def test_filter_by_status(self):
        """Test filtering projects by status."""
        active_projects = Project.objects.filter(status='ACTIVE')
        self.assertEqual(active_projects.count(), 1)
        self.assertEqual(active_projects.first(), self.project1)

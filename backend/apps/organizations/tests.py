from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import Organization


class OrganizationModelTest(TestCase):
    """Test cases for Organization model."""

    def setUp(self):
        """Set up test data."""
        self.org_data = {
            'name': 'Test Organization',
            'contact_email': 'test@example.com',
            'description': 'A test organization'
        }

    def test_create_organization(self):
        """Test creating an organization."""
        org = Organization.objects.create(**self.org_data)
        
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.contact_email, 'test@example.com')
        self.assertEqual(org.slug, 'test-organization')
        self.assertTrue(org.is_active)
        self.assertIsNotNone(org.created_at)
        self.assertIsNotNone(org.updated_at)

    def test_organization_str_representation(self):
        """Test string representation of organization."""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(str(org), 'Test Organization')

    def test_slug_auto_generation(self):
        """Test automatic slug generation from name."""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.slug, 'test-organization')

    def test_custom_slug(self):
        """Test creating organization with custom slug."""
        self.org_data['slug'] = 'custom-slug'
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.slug, 'custom-slug')

    def test_unique_slug_constraint(self):
        """Test that slug must be unique."""
        Organization.objects.create(**self.org_data)
        
        # Try to create another organization with the same slug
        with self.assertRaises(IntegrityError):
            Organization.objects.create(
                name='Another Organization',
                contact_email='another@example.com',
                slug='test-organization'
            )

    def test_invalid_email(self):
        """Test validation of contact email."""
        self.org_data['contact_email'] = 'invalid-email'
        org = Organization(**self.org_data)
        
        with self.assertRaises(ValidationError):
            org.full_clean()

    def test_project_count_property(self):
        """Test project_count property."""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.project_count, 0)
        
        # This will be tested more thoroughly when we have projects

    def test_active_project_count_property(self):
        """Test active_project_count property."""
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.active_project_count, 0)


class OrganizationQuerySetTest(TestCase):
    """Test cases for Organization querysets."""

    def setUp(self):
        """Set up test data."""
        self.active_org = Organization.objects.create(
            name='Active Org',
            contact_email='active@example.com',
            is_active=True
        )
        self.inactive_org = Organization.objects.create(
            name='Inactive Org',
            contact_email='inactive@example.com',
            is_active=False
        )

    def test_filter_active_organizations(self):
        """Test filtering active organizations."""
        active_orgs = Organization.objects.filter(is_active=True)
        self.assertEqual(active_orgs.count(), 1)
        self.assertEqual(active_orgs.first(), self.active_org)

    def test_filter_inactive_organizations(self):
        """Test filtering inactive organizations."""
        inactive_orgs = Organization.objects.filter(is_active=False)
        self.assertEqual(inactive_orgs.count(), 1)
        self.assertEqual(inactive_orgs.first(), self.inactive_org)

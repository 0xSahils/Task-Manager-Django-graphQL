from django.test import TestCase, RequestFactory
from django.contrib.auth.models import AnonymousUser
from graphene.test import Client
from project_management.schema import schema
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment


class GraphQLTestCase(TestCase):
    """Base test case for GraphQL tests."""

    def setUp(self):
        """Set up test data."""
        self.factory = RequestFactory()
        self.client = Client(schema)
        
        # Create test organization
        self.organization = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        
        # Create test project
        self.project = Project.objects.create(
            organization=self.organization,
            name='Test Project',
            description='A test project'
        )
        
        # Create test task
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task',
            description='A test task',
            assignee_email='assignee@example.com'
        )

    def create_request_with_organization(self, organization=None):
        """Create a mock request with organization context."""
        request = self.factory.get('/')
        request.user = AnonymousUser()
        request.organization = organization or self.organization
        return request


class OrganizationGraphQLTest(GraphQLTestCase):
    """Test GraphQL queries and mutations for organizations."""

    def test_organization_query(self):
        """Test querying a single organization."""
        query = '''
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    id
                    name
                    slug
                    contactEmail
                    isActive
                    projectCount
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(query, variables={'id': str(self.organization.id)}, context=context)
        
        self.assertIsNone(result.get('errors'))
        org_data = result['data']['organization']
        self.assertEqual(org_data['name'], 'Test Organization')
        self.assertEqual(org_data['slug'], 'test-org')

    def test_organizations_query(self):
        """Test querying all organizations."""
        query = '''
            query GetOrganizations {
                organizations {
                    edges {
                        node {
                            id
                            name
                            slug
                        }
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(query, context=context)
        
        self.assertIsNone(result.get('errors'))
        organizations = result['data']['organizations']['edges']
        self.assertEqual(len(organizations), 1)
        self.assertEqual(organizations[0]['node']['name'], 'Test Organization')

    def test_create_organization_mutation(self):
        """Test creating an organization."""
        mutation = '''
            mutation CreateOrganization($name: String!, $contactEmail: String!) {
                createOrganization(name: $name, contactEmail: $contactEmail) {
                    success
                    errors
                    organization {
                        id
                        name
                        contactEmail
                        slug
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            mutation,
            variables={
                'name': 'New Organization',
                'contactEmail': 'new@example.com'
            },
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        mutation_data = result['data']['createOrganization']
        self.assertTrue(mutation_data['success'])
        self.assertEqual(mutation_data['organization']['name'], 'New Organization')


class ProjectGraphQLTest(GraphQLTestCase):
    """Test GraphQL queries and mutations for projects."""

    def test_project_query(self):
        """Test querying a single project."""
        query = '''
            query GetProject($id: ID!) {
                project(id: $id) {
                    id
                    name
                    description
                    status
                    taskCount
                    completionRate
                    organization {
                        id
                        name
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(query, variables={'id': str(self.project.id)}, context=context)
        
        self.assertIsNone(result.get('errors'))
        project_data = result['data']['project']
        self.assertEqual(project_data['name'], 'Test Project')
        self.assertEqual(project_data['organization']['name'], 'Test Organization')

    def test_projects_by_organization_query(self):
        """Test querying projects by organization."""
        query = '''
            query GetProjectsByOrganization($organizationId: ID!) {
                projectsByOrganization(organizationId: $organizationId) {
                    id
                    name
                    status
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            query,
            variables={'organizationId': str(self.organization.id)},
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        projects = result['data']['projectsByOrganization']
        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]['name'], 'Test Project')

    def test_create_project_mutation(self):
        """Test creating a project."""
        mutation = '''
            mutation CreateProject($organizationId: ID!, $name: String!, $description: String) {
                createProject(organizationId: $organizationId, name: $name, description: $description) {
                    success
                    errors
                    project {
                        id
                        name
                        description
                        status
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            mutation,
            variables={
                'organizationId': str(self.organization.id),
                'name': 'New Project',
                'description': 'A new project'
            },
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        mutation_data = result['data']['createProject']
        self.assertTrue(mutation_data['success'])
        self.assertEqual(mutation_data['project']['name'], 'New Project')


class TaskGraphQLTest(GraphQLTestCase):
    """Test GraphQL queries and mutations for tasks."""

    def test_task_query(self):
        """Test querying a single task."""
        query = '''
            query GetTask($id: ID!) {
                task(id: $id) {
                    id
                    title
                    description
                    status
                    priority
                    assigneeEmail
                    commentCount
                    project {
                        id
                        name
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(query, variables={'id': str(self.task.id)}, context=context)
        
        self.assertIsNone(result.get('errors'))
        task_data = result['data']['task']
        self.assertEqual(task_data['title'], 'Test Task')
        self.assertEqual(task_data['project']['name'], 'Test Project')

    def test_tasks_by_project_query(self):
        """Test querying tasks by project."""
        query = '''
            query GetTasksByProject($projectId: ID!) {
                tasksByProject(projectId: $projectId) {
                    id
                    title
                    status
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            query,
            variables={'projectId': str(self.project.id)},
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        tasks = result['data']['tasksByProject']
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]['title'], 'Test Task')

    def test_create_task_mutation(self):
        """Test creating a task."""
        mutation = '''
            mutation CreateTask($projectId: ID!, $title: String!, $description: String) {
                createTask(projectId: $projectId, title: $title, description: $description) {
                    success
                    errors
                    task {
                        id
                        title
                        description
                        status
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            mutation,
            variables={
                'projectId': str(self.project.id),
                'title': 'New Task',
                'description': 'A new task'
            },
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        mutation_data = result['data']['createTask']
        self.assertTrue(mutation_data['success'])
        self.assertEqual(mutation_data['task']['title'], 'New Task')

    def test_add_task_comment_mutation(self):
        """Test adding a comment to a task."""
        mutation = '''
            mutation AddTaskComment($taskId: ID!, $content: String!, $authorEmail: String!) {
                addTaskComment(taskId: $taskId, content: $content, authorEmail: $authorEmail) {
                    success
                    errors
                    comment {
                        id
                        content
                        authorEmail
                    }
                }
            }
        '''
        
        context = self.create_request_with_organization()
        result = self.client.execute(
            mutation,
            variables={
                'taskId': str(self.task.id),
                'content': 'This is a test comment',
                'authorEmail': 'commenter@example.com'
            },
            context=context
        )
        
        self.assertIsNone(result.get('errors'))
        mutation_data = result['data']['addTaskComment']
        self.assertTrue(mutation_data['success'])
        self.assertEqual(mutation_data['comment']['content'], 'This is a test comment')

import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from .models import Project
from apps.organizations.models import Organization
from apps.organizations.utils import OrganizationPermissionMixin, require_organization_context


class ProjectType(DjangoObjectType):
    """GraphQL type for Project model."""
    
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()
    is_overdue = graphene.Boolean()
    
    class Meta:
        model = Project
        fields = '__all__'
        interfaces = (graphene.relay.Node,)

    def resolve_task_count(self, info):
        return self.task_count

    def resolve_completed_tasks(self, info):
        return self.completed_tasks

    def resolve_completion_rate(self, info):
        return self.completion_rate

    def resolve_is_overdue(self, info):
        return self.is_overdue


class ProjectStatsType(graphene.ObjectType):
    """GraphQL type for project statistics."""
    
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    overdue_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()


class ProjectQuery(OrganizationPermissionMixin, graphene.ObjectType):
    """GraphQL queries for Project."""

    project = graphene.Field(ProjectType, id=graphene.ID())
    projects = graphene.List(ProjectType)
    projects_by_organization = graphene.List(
        ProjectType,
        organization_id=graphene.ID()
    )
    project_stats = graphene.Field(
        ProjectStatsType,
        organization_id=graphene.ID()
    )

    def resolve_project(self, info, id):
        try:
            project = Project.objects.get(pk=id)
            organization = getattr(info.context, 'organization', None)

            # Ensure project belongs to the current organization context
            if organization and project.organization != organization:
                raise PermissionDenied("Access denied to this project")

            return project
        except Project.DoesNotExist:
            return None

    def resolve_projects(self, info, **kwargs):
        # Simpler: return all projects (no org context required)
        return list(Project.objects.all())

    def resolve_projects_by_organization(self, info, organization_id=None):
        context_org = getattr(info.context, 'organization', None)

        # If organization_id is provided, validate it matches context
        if organization_id:
            try:
                requested_org = Organization.objects.get(pk=organization_id)
                if context_org and requested_org != context_org:
                    raise PermissionDenied("Access denied to this organization")
                organization = requested_org
            except Organization.DoesNotExist:
                return []
        else:
            organization = context_org

        if not organization:
            # No org context and no org id passed: return all for simplicity
            return list(Project.objects.all())

        return list(Project.objects.filter(organization=organization))

    def resolve_project_stats(self, info, organization_id=None):
        context_org = getattr(info.context, 'organization', None)

        # If organization_id is provided, validate it matches context
        if organization_id:
            try:
                requested_org = Organization.objects.get(pk=organization_id)
                if context_org and requested_org != context_org:
                    raise PermissionDenied("Access denied to this organization")
                organization = requested_org
            except Organization.DoesNotExist:
                return None
        else:
            organization = context_org

        if not organization:
            # No org context: compute stats across all projects
            projects = Project.objects.all()
        else:
            projects = Project.objects.filter(organization=organization)

        total_projects = projects.count()
        active_projects = projects.filter(status='ACTIVE').count()
        completed_projects = projects.filter(status='COMPLETED').count()

        # Calculate overdue projects
        from django.utils import timezone
        overdue_projects = projects.filter(
            due_date__lt=timezone.now().date(),
            status__in=['ACTIVE', 'ON_HOLD']
        ).count()

        # Calculate task statistics
        total_tasks = sum(project.task_count for project in projects)
        completed_tasks = sum(project.completed_tasks for project in projects)

        overall_completion_rate = 0.0
        if total_tasks > 0:
            overall_completion_rate = (completed_tasks / total_tasks) * 100.0

        return ProjectStatsType(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            overdue_projects=overdue_projects,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=round(overall_completion_rate, 2),
        )


class CreateProjectMutation(graphene.Mutation):
    """Create a new project."""
    
    class Arguments:
        organization_id = graphene.ID(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, organization_id, name, description=None, status=None, due_date=None):
        try:
            organization = Organization.objects.get(pk=organization_id)
            
            project = Project.objects.create(
                organization=organization,
                name=name,
                description=description or '',
                status=status or 'ACTIVE',
                due_date=due_date
            )
            
            return CreateProjectMutation(
                project=project,
                success=True,
                errors=[]
            )
        except Organization.DoesNotExist:
            return CreateProjectMutation(
                project=None,
                success=False,
                errors=["Organization not found"]
            )
        except Exception as e:
            return CreateProjectMutation(
                project=None,
                success=False,
                errors=[str(e)]
            )


class UpdateProjectMutation(graphene.Mutation):
    """Update an existing project."""
    
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, **kwargs):
        try:
            project = Project.objects.get(pk=id)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(project, field, value)
            
            project.save()
            
            return UpdateProjectMutation(
                project=project,
                success=True,
                errors=[]
            )
        except Project.DoesNotExist:
            return UpdateProjectMutation(
                project=None,
                success=False,
                errors=["Project not found"]
            )
        except Exception as e:
            return UpdateProjectMutation(
                project=None,
                success=False,
                errors=[str(e)]
            )


class ProjectMutation(graphene.ObjectType):
    """Root mutations for Project."""
    
    create_project = CreateProjectMutation.Field()
    update_project = UpdateProjectMutation.Field()

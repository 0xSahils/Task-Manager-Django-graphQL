import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from .models import Task, TaskComment
from apps.projects.models import Project
from apps.organizations.utils import OrganizationPermissionMixin, require_organization_context


class TaskCommentType(DjangoObjectType):
    """GraphQL type for TaskComment model."""
    
    class Meta:
        model = TaskComment
        fields = '__all__'
        interfaces = (graphene.relay.Node,)


class TaskType(DjangoObjectType):
    """GraphQL type for Task model."""
    
    is_overdue = graphene.Boolean()
    comment_count = graphene.Int()
    comments = graphene.List(TaskCommentType)
    
    class Meta:
        model = Task
        fields = '__all__'
        interfaces = (graphene.relay.Node,)

    def resolve_is_overdue(self, info):
        return self.is_overdue

    def resolve_comment_count(self, info):
        return self.comment_count

    def resolve_comments(self, info):
        return self.comments.all()


class TaskQuery(OrganizationPermissionMixin, graphene.ObjectType):
    """GraphQL queries for Task."""

    task = graphene.Field(TaskType, id=graphene.ID())
    tasks = graphene.List(TaskType)
    tasks_by_project = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True)
    )
    task_comment = graphene.Field(TaskCommentType, id=graphene.ID())
    task_comments = graphene.List(
        TaskCommentType,
        task_id=graphene.ID(required=True)
    )

    def resolve_task(self, info, id):
        try:
            task = Task.objects.get(pk=id)
            organization = getattr(info.context, 'organization', None)

            # Ensure task belongs to the current organization context
            if organization and task.project.organization != organization:
                raise PermissionDenied("Access denied to this task")

            return task
        except Task.DoesNotExist:
            return None

    def resolve_tasks(self, info, **kwargs):
        # Simpler: return all tasks (no org context required)
        return list(Task.objects.all())

    def resolve_tasks_by_project(self, info, project_id):
        try:
            project = Project.objects.get(pk=project_id)
            organization = getattr(info.context, 'organization', None)

            # Ensure project belongs to the current organization context
            if organization and project.organization != organization:
                raise PermissionDenied("Access denied to this project")

            return Task.objects.filter(project=project)
        except Project.DoesNotExist:
            return []

    def resolve_task_comment(self, info, id):
        try:
            comment = TaskComment.objects.get(pk=id)
            organization = getattr(info.context, 'organization', None)

            # Ensure comment belongs to the current organization context
            if organization and comment.task.project.organization != organization:
                raise PermissionDenied("Access denied to this comment")

            return comment
        except TaskComment.DoesNotExist:
            return None

    def resolve_task_comments(self, info, task_id):
        try:
            task = Task.objects.get(pk=task_id)
            organization = getattr(info.context, 'organization', None)

            # Ensure task belongs to the current organization context
            if organization and task.project.organization != organization:
                raise PermissionDenied("Access denied to this task")

            return list(TaskComment.objects.filter(task=task))
        except Task.DoesNotExist:
            return []


class CreateTaskMutation(graphene.Mutation):
    """Create a new task."""
    
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, project_id, title, **kwargs):
        try:
            project = Project.objects.get(pk=project_id)
            
            task = Task.objects.create(
                project=project,
                title=title,
                description=kwargs.get('description', ''),
                status=kwargs.get('status', 'TODO'),
                priority=kwargs.get('priority', 'MEDIUM'),
                assignee_email=kwargs.get('assignee_email', ''),
                due_date=kwargs.get('due_date')
            )
            
            return CreateTaskMutation(
                task=task,
                success=True,
                errors=[]
            )
        except Project.DoesNotExist:
            return CreateTaskMutation(
                task=None,
                success=False,
                errors=["Project not found"]
            )
        except Exception as e:
            return CreateTaskMutation(
                task=None,
                success=False,
                errors=[str(e)]
            )


class UpdateTaskMutation(graphene.Mutation):
    """Update an existing task."""
    
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        priority = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, **kwargs):
        try:
            task = Task.objects.get(pk=id)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(task, field, value)
            
            task.save()
            
            return UpdateTaskMutation(
                task=task,
                success=True,
                errors=[]
            )
        except Task.DoesNotExist:
            return UpdateTaskMutation(
                task=None,
                success=False,
                errors=["Task not found"]
            )
        except Exception as e:
            return UpdateTaskMutation(
                task=None,
                success=False,
                errors=[str(e)]
            )


class AddTaskCommentMutation(graphene.Mutation):
    """Add a comment to a task."""
    
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, task_id, content, author_email):
        try:
            task = Task.objects.get(pk=task_id)
            
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )
            
            return AddTaskCommentMutation(
                comment=comment,
                success=True,
                errors=[]
            )
        except Task.DoesNotExist:
            return AddTaskCommentMutation(
                comment=None,
                success=False,
                errors=["Task not found"]
            )
        except Exception as e:
            return AddTaskCommentMutation(
                comment=None,
                success=False,
                errors=[str(e)]
            )


class TaskMutation(graphene.ObjectType):
    """Root mutations for Task."""
    
    create_task = CreateTaskMutation.Field()
    update_task = UpdateTaskMutation.Field()
    add_task_comment = AddTaskCommentMutation.Field()

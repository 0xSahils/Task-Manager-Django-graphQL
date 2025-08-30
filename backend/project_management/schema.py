import graphene
from apps.organizations.schema import OrganizationQuery, OrganizationMutation
from apps.projects.schema import ProjectQuery, ProjectMutation
from apps.tasks.schema import TaskQuery, TaskMutation


class Query(
    OrganizationQuery,
    ProjectQuery,
    TaskQuery,
    graphene.ObjectType
):
    """Root Query combining all app queries."""
    pass


class Mutation(
    OrganizationMutation,
    ProjectMutation,
    TaskMutation,
    graphene.ObjectType
):
    """Root Mutation combining all app mutations."""
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)

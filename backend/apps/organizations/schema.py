import graphene
from graphene_django import DjangoObjectType
from django.db.models import Q
from .models import Organization


class OrganizationType(DjangoObjectType):
    """GraphQL type for Organization model."""
    
    project_count = graphene.Int()
    active_project_count = graphene.Int()
    
    class Meta:
        model = Organization
        fields = '__all__'
        interfaces = (graphene.relay.Node,)

    def resolve_project_count(self, info):
        return self.project_count

    def resolve_active_project_count(self, info):
        return self.active_project_count


class OrganizationQuery(graphene.ObjectType):
    """GraphQL queries for Organization."""
    
    organization = graphene.Field(OrganizationType, id=graphene.ID())
    organizations = graphene.List(OrganizationType)
    organization_by_slug = graphene.Field(OrganizationType, slug=graphene.String())

    def resolve_organization(self, info, id):
        try:
            return Organization.objects.get(pk=id)
        except Organization.DoesNotExist:
            return None

    def resolve_organizations(self, info, **kwargs):
        return list(Organization.objects.filter(is_active=True))

    def resolve_organization_by_slug(self, info, slug):
        try:
            return Organization.objects.get(slug=slug, is_active=True)
        except Organization.DoesNotExist:
            return None


class CreateOrganizationMutation(graphene.Mutation):
    """Create a new organization."""
    
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)
        description = graphene.String()
        slug = graphene.String()

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, name, contact_email, description=None, slug=None):
        try:
            organization = Organization.objects.create(
                name=name,
                contact_email=contact_email,
                description=description or '',
                slug=slug
            )
            return CreateOrganizationMutation(
                organization=organization,
                success=True,
                errors=[]
            )
        except Exception as e:
            return CreateOrganizationMutation(
                organization=None,
                success=False,
                errors=[str(e)]
            )


class UpdateOrganizationMutation(graphene.Mutation):
    """Update an existing organization."""
    
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        contact_email = graphene.String()
        description = graphene.String()
        is_active = graphene.Boolean()

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, **kwargs):
        try:
            organization = Organization.objects.get(pk=id)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(organization, field, value)
            
            organization.save()
            
            return UpdateOrganizationMutation(
                organization=organization,
                success=True,
                errors=[]
            )
        except Organization.DoesNotExist:
            return UpdateOrganizationMutation(
                organization=None,
                success=False,
                errors=["Organization not found"]
            )
        except Exception as e:
            return UpdateOrganizationMutation(
                organization=None,
                success=False,
                errors=[str(e)]
            )


class OrganizationMutation(graphene.ObjectType):
    """Root mutations for Organization."""
    
    create_organization = CreateOrganizationMutation.Field()
    update_organization = UpdateOrganizationMutation.Field()

import graphene
import graphql_jwt

import users.schema
import curriculum.schema
import submissions.schema
import analysis.schema


class Query(
    users.schema.Query,
    curriculum.schema.Query,
    submissions.schema.Query,
    analysis.schema.Query,
    graphene.ObjectType,
):
    pass


class Mutation(
    users.schema.Mutation,
    curriculum.schema.Mutation,
    submissions.schema.Mutation,
    graphene.ObjectType,
):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)

import { GraphQLOutputType, GraphQLInputType } from 'graphql'
import { Inventory, Type } from '../../interface'
import { PGCatalog, PGCatalogType, PGCatalogProcedure } from '../../postgres/introspection'
import BuildToken from '../../graphql/schema/BuildToken'
import getGQLType from '../../graphql/schema/getGQLType'
import getTypeFromPGType from '../../postgres/inventory/type/getTypeFromPGType'

/**
 * Creates some signature fixtures for a Postgres procedure. Contains the
 * Postgres type, the interface type, and the GraphQL type for all of the
 * arguments and the return type.
 */
export default function createPGProcedureSignatureFixtures (
  buildToken: BuildToken,
  pgCatalog: PGCatalog,
  pgProcedure: PGCatalogProcedure,
): {
  args: Array<{
    name: string,
    pgType: PGCatalogType,
    type: Type<mixed>,
    gqlType: GraphQLInputType<mixed>,
  }>,
  return: {
    pgType: PGCatalogType,
    type: Type<mixed>,
    gqlType: GraphQLOutputType<mixed>,
  },
} {
  const { inventory } = buildToken
  return {
    // Convert our args into their appropriate forms, also in this we create
    // the argument name if it does not exist.
    args: pgProcedure.argTypeIds.map((typeId, i) => {
      const name = pgProcedure.argNames[i] || `arg-${i}`
      const pgType = pgCatalog.assertGetType(typeId)
      const type = getTypeFromPGType(pgCatalog, pgType, inventory)
      const gqlType = getGQLType(buildToken, type, true)
      return { name, pgType, type, gqlType }
    }),
    return: (() => {
      // Convert our return type into its appropriate forms.
      const pgType = pgCatalog.assertGetType(pgProcedure.returnTypeId)
      const type = getTypeFromPGType(pgCatalog, pgType, inventory)
      const gqlType = getGQLType(buildToken, type, false)
      return { pgType, type, gqlType }
    })(),
  }
}

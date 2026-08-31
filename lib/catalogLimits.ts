/**
 * Most ids `resolveProducts` will look up in one call. Anything beyond this is
 * dropped from the query, so callers that reconcile state against the result
 * must not treat a longer list as "these products are gone".
 *
 * Plain module (no "server-only") so client components can read it too.
 */
export const MAX_RESOLVE_IDS = 200;

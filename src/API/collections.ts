// Единственное место, где имена коллекций PocketBase заданы строками.
// Использование: pb.collection(COLLECTIONS.wiki) или ключ SWR COLLECTIONS.users.
export const COLLECTIONS = {
  users: "users",
  sessions: "sessions",
  applications: "applications",
  characters: "characters",
  listSchemas: "list_schemas",
  wiki: "wiki",
  toolsConst: "tools_const",
  guildCity: "tools_guild_city",
  guildHistory: "tools_guild_history",
  necropolis: "tools_necropolis",
  genres: "genres",
  systems: "systems",
  companies: "companies",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

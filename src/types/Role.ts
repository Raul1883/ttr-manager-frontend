// Роли пользователей. В PocketBase поле `users.role` — строка с одним из этих
// значений, поэтому везде сравнения идут через константы, а не «магические» литералы.
export const ROLES = {
  master: "master",
  player: "player",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Приводит произвольную строку из PB к типу Role; всё неизвестное — null.
export function toRole(value: unknown): Role | null {
  return value === ROLES.master || value === ROLES.player ? value : null;
}

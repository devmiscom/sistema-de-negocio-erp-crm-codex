import { PermissionKey } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";

export function userHasPermission(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, permission: PermissionKey) {
  if (user.role.type === "SUPER_ADMIN") {
    return true;
  }

  const rolePermissionKeys = new Set(user.role.rolePermissions.map((rp) => rp.permission.key));
  const userOverride = user.userPermission.find((up) => up.permission.key === permission);

  if (typeof userOverride?.allowed === "boolean") {
    return userOverride.allowed;
  }

  if (user.role.type === "ADMIN" && permission === "settings.manage") {
    return false;
  }

  return rolePermissionKeys.has(permission);
}

export async function requirePermission(permission: PermissionKey) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, reason: "not_authenticated" };
  }
  if (!userHasPermission(user, permission)) {
    return { ok: false as const, reason: "forbidden", user };
  }
  return { ok: true as const, user };
}

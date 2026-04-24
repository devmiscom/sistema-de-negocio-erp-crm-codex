export type PermissionKey =
  | "sales.view"
  | "sales.manage"
  | "crm.view"
  | "crm.manage"
  | "erp.view"
  | "erp.manage"
  | "team.manage"
  | "roles.manage"
  | "reports.view"
  | "upload.manage"
  | "settings.manage";

export const PERMISSION_KEYS: PermissionKey[] = [
  "sales.view",
  "sales.manage",
  "crm.view",
  "crm.manage",
  "erp.view",
  "erp.manage",
  "team.manage",
  "roles.manage",
  "reports.view",
  "upload.manage",
  "settings.manage"
];

export const MODULE_PERMISSIONS: Record<string, PermissionKey[]> = {
  vendas: ["sales.view", "sales.manage"],
  crm: ["crm.view", "crm.manage"],
  erp: ["erp.view", "erp.manage"],
  equipe: ["team.manage", "roles.manage"],
  relatorios: ["reports.view"],
  uploads: ["upload.manage"],
  configuracoes: ["settings.manage"]
};

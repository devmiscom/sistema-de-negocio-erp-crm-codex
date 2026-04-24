import bcrypt from "bcryptjs";
import { PrismaClient, RoleType } from "@prisma/client";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "sales.view", label: "Visualizar vendas e PDV", module: "Vendas" },
  { key: "sales.manage", label: "Gerenciar vendas e PDV", module: "Vendas" },
  { key: "crm.view", label: "Visualizar CRM", module: "CRM" },
  { key: "crm.manage", label: "Gerenciar CRM", module: "CRM" },
  { key: "erp.view", label: "Visualizar ERP", module: "ERP" },
  { key: "erp.manage", label: "Gerenciar ERP", module: "ERP" },
  { key: "team.manage", label: "Gerenciar colaboradores", module: "Equipe" },
  { key: "roles.manage", label: "Gerenciar funções/perfis", module: "Equipe" },
  { key: "reports.view", label: "Visualizar relatórios", module: "Relatórios" },
  { key: "upload.manage", label: "Gerenciar uploads", module: "Uploads" },
  { key: "settings.manage", label: "Gerenciar nome/cores do sistema", module: "Configuração" }
];

async function main() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: permission,
      create: permission
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const nonSettingsPermissions = allPermissions.filter((p) => p.key !== "settings.manage");
  const employeeDefaultPermissions = allPermissions.filter((p) =>
    ["sales.view", "crm.view", "erp.view", "reports.view", "upload.manage"].includes(p.key)
  );

  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: { type: RoleType.SUPER_ADMIN, isSystem: true },
    create: { name: "SUPER_ADMIN", type: RoleType.SUPER_ADMIN, isSystem: true }
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { type: RoleType.ADMIN, isSystem: true },
    create: { name: "ADMIN", type: RoleType.ADMIN, isSystem: true }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: "EMPLOYEE" },
    update: { type: RoleType.EMPLOYEE, isSystem: true },
    create: { name: "EMPLOYEE", type: RoleType.EMPLOYEE, isSystem: true }
  });

  await prisma.rolePermission.deleteMany({
    where: { roleId: { in: [superAdminRole.id, adminRole.id, employeeRole.id] } }
  });

  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id }))
  });

  await prisma.rolePermission.createMany({
    data: nonSettingsPermissions.map((p) => ({ roleId: adminRole.id, permissionId: p.id }))
  });

  await prisma.rolePermission.createMany({
    data: employeeDefaultPermissions.map((p) => ({ roleId: employeeRole.id, permissionId: p.id }))
  });

  await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      systemName: "Sistema ERP CRM",
      primaryColor: "#0057B8",
      secondaryColor: "#0A2540"
    }
  });

  await prisma.uploadSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      allowedExtensions: "doc,docx,pptx,pdf,jpg,jpeg,png,webp,avif,mp4",
      maxFileSizeMb: 20
    }
  });

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@empresa.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(superAdminPassword, 12);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      passwordHash: hash,
      roleId: superAdminRole.id,
      isActive: true
    },
    create: {
      name: "Super Administrador",
      email: superAdminEmail,
      passwordHash: hash,
      roleId: superAdminRole.id
    }
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

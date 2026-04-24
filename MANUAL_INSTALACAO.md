# Manual de Instalação - Sistema ERP CRM

## 1. Requisitos
- Node.js 20+ e npm
- MySQL 8+
- Git (opcional)

## 2. Configurar o projeto
1. No diretório do projeto, instale as dependências:
```bash
npm install
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Edite o `.env` com seus dados:
- `DATABASE_URL`: conexão MySQL
- `JWT_SECRET`: segredo forte (mínimo recomendado 32 caracteres)
- `SUPER_ADMIN_EMAIL`: e-mail do super administrador inicial
- `SUPER_ADMIN_PASSWORD`: senha inicial do super administrador

Exemplo:
```env
DATABASE_URL="mysql://root:senha@localhost:3306/sistema_negocio"
JWT_SECRET="chave-super-secreta-e-forte-para-producao"
SUPER_ADMIN_EMAIL="superadmin@empresa.com"
SUPER_ADMIN_PASSWORD="SenhaForte123!"
```

## 3. Criar banco e tabelas
1. Crie o banco no MySQL:
```sql
CREATE DATABASE sistema_negocio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Execute migração:
```bash
npm run prisma:migrate -- --name init
```

3. Gere o client Prisma:
```bash
npm run prisma:generate
```

4. Popule dados iniciais (roles, permissões e super admin):
```bash
npm run prisma:seed
```

## 4. Executar em desenvolvimento
```bash
npm run dev
```

Abra:
- [http://localhost:3000](http://localhost:3000)

## 5. Build e produção
1. Build:
```bash
npm run build
```

2. Subir produção:
```bash
npm run start
```

## 6. Segurança recomendada para produção
- Use HTTPS (Nginx/Traefik/Cloudflare).
- Troque imediatamente a senha padrão do super admin.
- Use `JWT_SECRET` forte e exclusivo.
- Restrinja acesso ao MySQL por rede interna/firewall.
- Configure backup diário do banco.
- Configure rotação de logs e monitoramento.

## 7. Estrutura funcional implementada
- Vendas & PDV: pedidos, itens, valores, estatísticas.
- CRM: clientes, leads, contatos, estatísticas.
- ERP: estoque, compras, NF, estatísticas.
- Financeiro: reservado para futura implementação.
- Uploads com extensões e limite em MB configuráveis.
- Gestão de colaboradores, roles e permissões por setor.
- Super Admin:
  - gerencia tudo
  - altera nome e cores do sistema
- Admin:
  - gerencia tudo, exceto nome/cores do sistema
- Employee e roles personalizadas:
  - acesso por permissões marcadas (checkbox por setor)

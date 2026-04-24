# Manual de Uso - Sistema ERP CRM

## 1. Acesso inicial
1. Entre em [http://localhost:3000](http://localhost:3000)
2. Faça login com o usuário super admin criado no seed.

## 2. Perfis de usuário
- `SUPER_ADMIN`
  - acesso total
  - pode alterar nome e cores do sistema
  - pode configurar uploads
- `ADMIN`
  - acesso total aos módulos operacionais
  - não altera nome/cores do sistema
  - pode configurar uploads
- `EMPLOYEE` e `CUSTOM`
  - acesso conforme permissões marcadas por função/usuário

## 3. Dashboard
- Exibe atalhos para:
  - Vendas & PDV
  - CRM
  - ERP
  - Relatórios
  - Arquivos
  - Colaboradores
  - Funções (Roles)
  - Configurações
- Financeiro aparece como “futuro”.

## 4. Módulo Vendas & PDV
- Cadastre produtos (SKU, preço, estoque, mínimo).
- Cadastre pedidos (cliente, item, quantidade, valor unitário).
- Veja indicadores:
  - total de pedidos
  - faturamento
  - ticket médio

## 5. Módulo CRM
- Cadastre clientes.
- Cadastre leads com status:
  - NEW, QUALIFIED, NEGOTIATION, WON, LOST
- Cadastre contatos (com ou sem vínculo a cliente).

## 6. Módulo ERP
- Registre compras.
- Registre notas fiscais (NF).
- Faça movimentação de estoque:
  - entrada
  - saída
  - ajuste

## 7. Relatórios
- Vendas: pedidos, faturamento e ticket médio.
- CRM: clientes e leads por status.
- ERP: compras, total comprado, NF emitidas e estoque crítico.

## 8. Colaboradores
- Cadastre funcionários com função (role).
- Ative/inative usuários.
- Faça override de permissão por usuário (permitir/negar específico).

## 9. Funções (Roles)
- Crie funções personalizadas.
- Marque permissões por checkbox:
  - vendas
  - CRM
  - ERP
  - equipe
  - relatórios
  - uploads
  - configurações

## 10. Uploads de arquivos
- Envie arquivo com:
  - módulo
  - tipo de entidade
  - ID da entidade
- Veja histórico de anexos enviados.

## 11. Configuração de extensões e tamanho de arquivos
- Em `Configurações`, Super Admin e Admin podem definir:
  - extensões permitidas (campo texto por vírgula)
  - tamanho máximo por arquivo em MB
- Exemplo de extensões:
  - `doc,docx,pptx,pdf,jpg,png,webp,avif,mp4`

## 12. Recomendações operacionais
- Revise permissões antes de liberar novos usuários.
- Padronize nomenclatura de entidades para uploads.
- Monitore produtos com estoque crítico via tela de relatórios.

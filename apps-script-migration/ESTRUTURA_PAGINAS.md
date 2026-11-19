# Estrutura de páginas — NOVOGR-FE para Google Apps Script

## 1. Acesso
- Login: autenticação e validação de acesso antes de abrir o sistema.
- Troca de senha: fluxo/modal existente para usuários que precisam atualizar a senha.

## 2. Estrutura principal
- Layout principal (AppShell): cabeçalho, navegação, conteúdo, identidade visual e adaptação desktop/mobile.
- Início (menu): página inicial e acesso aos módulos.
- Dashboard: indicadores e visão geral operacional apresentados na área inicial.

## 3. Páginas operacionais
1. Checklist
2. Averbação
3. Monitoramento (SM)
4. Lançamento
5. Controle / Pré-alerta
6. Escala
7. Disponibilidade
8. Ordem de Serviço
9. Cobranças
10. Lista de E-mails
11. Calendário
12. Lista de Presença
13. Rotas

## 4. Páginas administrativas
- Cadastro: usuários e acessos.
- Configurações: visibilidade e ordenação das páginas e configurações gerais.
- Histórico: consulta do histórico de ações, restrito a administradores conforme as regras atuais.

## 5. Elementos compartilhados
- Controle de permissões por usuário e por página.
- Modais de páginas restritas e de alteração de senha.
- Avisos/notificações e banners.
- Preferências e papel de parede.
- Desfazer última ação (Ctrl+Z), quando compatível com a operação.
- Registro de sessão e tempo de presença.

## 6. Ordem de implementação
1. Shell, navegação e responsividade.
2. Login, sessão e permissões.
3. Início e Dashboard.
4. Páginas operacionais, uma por uma, preservando campos, tabelas, filtros e ações do original.
5. Páginas administrativas e histórico.
6. Integração com Sheets/Drive e validação de cada fluxo.

## Observações de fidelidade e plataforma
- Esta lista foi extraída da navegação e dos tipos de página do App.tsx e da auditoria do projeto.
- O item risk aparece como tipo interno de aba, mas não consta como item independente na lista principal de navegação; sua localização funcional será confirmada ao portar o fluxo correspondente.
- O Apps Script não reproduz diretamente a sessão Firebase/Google popup nem o listener em tempo real do Firebase RTDB. Esses pontos exigem adaptação técnica, mantendo as regras de acesso e os fluxos de negócio sempre que possível.
- Este documento define a estrutura; não significa que todas as páginas já estejam implementadas.

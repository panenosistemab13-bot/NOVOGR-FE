# NOVOGR-FE → Google Apps Script Migration Audit

## Source repository
- Repository: panenosistemab13-bot/NOVOGR-FE
- Source branch: main
- Migration branch: migration/apps-script (created separately; source main remains unchanged)

## Goal
Rebuild the application for Google Apps Script using Google Sheets for structured data and Google Drive for documents, while preserving the source application’s navigation, module behavior, labels, visual identity, and workflows as closely as the GAS platform allows.

## Source architecture observed
- React + TypeScript, Vite, Tailwind utilities, Lucide icons, Motion, Recharts, Three.js.
- Firebase Authentication (Google popup), Firestore, Realtime Database, and Firebase Storage.
- Existing frontend modules contain large implementations and must be ported module-by-module rather than replaced by a generic CRUD shell.
- Source files are retained unchanged on `main`.

## Modules identified in App.tsx and pagesConfig
- Início / Dashboard
- Checklist
- Averbação
- Monitoramento (SM)
- Lançamento
- Controle / Pré-alerta
- Cadastro / users and access
- Configurações / page visibility, page ordering and history
- Escala
- Disponibilidade
- Ordem de Serviço
- Cobranças
- Lista de E-mails
- Calendário
- Lista de Presença
- Rotas

## Migration design
1. Apps Script web app entry point and HTML SPA shell.
2. Server-side service layer (`google.script.run`) with explicit methods and validation.
3. Sheets tables for records and system settings; Drive folder/file metadata for uploaded documents.
4. Auth/access model using Google account identity available to Apps Script and server-side authorization checks. The original Google popup/Firebase session flow cannot be copied verbatim into Apps Script.
5. Realtime replacement: Apps Script + Sheets does not provide Firebase RTDB onValue. Use refresh/polling, cache, and write timestamps; document latency limits and avoid a false claim of Firebase-equivalent realtime.
6. UI migration: keep original page labels, fields, operations, table behaviors, and layouts; replace React-only libraries with compatible HTML/CSS/JS or Apps Script-supported approaches. Three.js/Motion/Recharts dependencies may need lightweight equivalents.

## Initial starter status
The first Apps Script deployment currently contains only generic starter files (Config.gs, Setup.gs, Codigo.gs, Index.html). That starter UI is not the application migration and should not be treated as complete. The next work is replacing it with the actual migrated app.

## Work order
- Inventory module source and dependencies; identify shared Firebase paths and data shapes.
- Implement backend storage/auth/document services.
- Implement shell, navigation, login/authorization, dashboard.
- Port each module and its data transformations.
- Validate each module against the original source and check responsive behavior.
- Keep migration work isolated on this branch until it is tested; do not overwrite `main`.

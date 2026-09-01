# Review Checklist

## `src/`

- [x] `src/env.js`

## `src/app/`

- [x] `src/app/layout.tsx`
- [x] `src/app/page.tsx`

## `src/app/(dashboard)/`

- [ ] `src/app/(dashboard)/DashboardShell.tsx`
- [ ] `src/app/(dashboard)/layout.tsx`

## `src/app/(dashboard)/clients/`

- [ ] `src/app/(dashboard)/clients/page.tsx`

## `src/app/(dashboard)/clients/[id]/`

- [ ] `src/app/(dashboard)/clients/[id]/page.tsx`

## `src/app/(dashboard)/dashboard/`

- [ ] `src/app/(dashboard)/dashboard/page.tsx`

## `src/app/(dashboard)/notifications/`

- [ ] `src/app/(dashboard)/notifications/page.tsx`

## `src/app/(dashboard)/plans/`

- [ ] `src/app/(dashboard)/plans/page.tsx`

## `src/app/(dashboard)/projects/`

- [ ] `src/app/(dashboard)/projects/page.tsx`

## `src/app/(dashboard)/projects/[id]/`

- [ ] `src/app/(dashboard)/projects/[id]/page.tsx`

## `src/app/(dashboard)/proposals/`

- [ ] `src/app/(dashboard)/proposals/page.tsx`

## `src/app/(dashboard)/proposals/[id]/`

- [ ] `src/app/(dashboard)/proposals/[id]/page.tsx`

## `src/app/(dashboard)/settings/[tab]/`

- [ ] `src/app/(dashboard)/settings/[tab]/page.tsx`

## `src/app/api/auth/[...all]/`

- [ ] `src/app/api/auth/[...all]/route.ts`

## `src/app/api/trpc/[trpc]/`

- [ ] `src/app/api/trpc/[trpc]/route.ts`

## `src/app/portal/`

- [ ] `src/app/portal/layout.tsx`

## `src/app/portal/[token1]/[token2]/`

- [ ] `src/app/portal/[token1]/[token2]/page.tsx`

## `src/app/portal/[token1]/[token2]/project/[projectId]/[[...tab]]/`

- [ ] `src/app/portal/[token1]/[token2]/project/[projectId]/[[...tab]]/page.tsx`

## `src/app/portal/[token1]/[token2]/proposal/[proposalId]/`

- [ ] `src/app/portal/[token1]/[token2]/proposal/[proposalId]/page.tsx`

## `src/components/`

- [ ] `src/components/ProjectCard.tsx`

## `src/components/clients/`

- [ ] `src/components/clients/ClientPortalSection.tsx`
- [ ] `src/components/clients/InfoRow.tsx`

## `src/components/dashboard/`

- [ ] `src/components/dashboard/SectionHead.tsx`
- [ ] `src/components/dashboard/StatTile.tsx`

## `src/components/landing/`

- [x] `src/components/landing/GoogleCta.tsx`

## `src/components/portal/`

- [ ] `src/components/portal/GateScreen.tsx`
- [ ] `src/components/portal/MiniStat.tsx`
- [ ] `src/components/portal/PortalChrome.tsx`
- [ ] `src/components/portal/PortalContractTab.tsx`
- [ ] `src/components/portal/PortalGate.tsx`
- [ ] `src/components/portal/PortalLanding.tsx`
- [ ] `src/components/portal/PortalMessagesTab.tsx`
- [ ] `src/components/portal/PortalOverviewTab.tsx`
- [ ] `src/components/portal/PortalProjectView.tsx`
- [ ] `src/components/portal/PortalProposalView.tsx`
- [ ] `src/components/portal/PortalSummaryRow.tsx`

## `src/components/projects/`

- [ ] `src/components/projects/ProjectSidebar.tsx`
- [ ] `src/components/projects/ProjectThread.tsx`
- [ ] `src/components/projects/Stat.tsx`

## `src/components/proposals/`

- [ ] `src/components/proposals/ProposalToolbar.tsx`
- [ ] `src/components/proposals/SheetButton.tsx`
- [ ] `src/components/proposals/SummaryRow.tsx`
- [ ] `src/components/proposals/ToolButton.tsx`
- [ ] `src/components/proposals/ToolbarIcons.tsx`

## `src/components/provider/`

- [ ] `src/components/provider/AddClientModal.tsx`
- [ ] `src/components/provider/StatusMessage.tsx`

## `src/components/settings/`

- [ ] `src/components/settings/AccountSection.tsx`
- [ ] `src/components/settings/BrandingSection.tsx`
- [ ] `src/components/settings/InvoiceSection.tsx`
- [ ] `src/components/settings/PlanSection.tsx`
- [ ] `src/components/settings/ProfileSection.tsx`

## `src/components/shared/`

- [ ] `src/components/shared/Button.tsx`
- [ ] `src/components/shared/Dialog.tsx`
- [ ] `src/components/shared/Field.tsx`
- [ ] `src/components/shared/Input.tsx`
- [ ] `src/components/shared/Kbd.tsx`
- [ ] `src/components/shared/LoadingIcon.tsx`
- [ ] `src/components/shared/LoadingScreen.tsx`
- [ ] `src/components/shared/Select.tsx`
- [ ] `src/components/shared/ServerError.tsx`
- [ ] `src/components/shared/Tag.tsx`
- [ ] `src/components/shared/Textarea.tsx`
- [ ] `src/components/shared/Toggle.tsx`
- [ ] `src/components/shared/index.ts`

## `src/components/shared/icon/`

- [ ] `src/components/shared/icon/IconBell.tsx`
- [ ] `src/components/shared/icon/IconClients.tsx`
- [ ] `src/components/shared/icon/IconDashboard.tsx`
- [ ] `src/components/shared/icon/IconMenu.tsx`
- [ ] `src/components/shared/icon/IconProjects.tsx`
- [ ] `src/components/shared/icon/IconProposals.tsx`
- [ ] `src/components/shared/icon/IconSearch.tsx`
- [ ] `src/components/shared/icon/Svg.tsx`

## `src/components/shell/`

- [ ] `src/components/shell/AddClientDialog.tsx`
- [ ] `src/components/shell/Avatar.tsx`
- [ ] `src/components/shell/CommandPalette.tsx`
- [ ] `src/components/shell/Header.tsx`
- [ ] `src/components/shell/MessageCenter.tsx`
- [ ] `src/components/shell/Sidebar.tsx`
- [ ] `src/components/shell/initials.ts`
- [ ] `src/components/shell/usePageTitle.ts`

## `src/context/`

- [ ] `src/context/addClientModalContext.tsx`
- [ ] `src/context/statusMessage.tsx`

## `src/hook/`

- [ ] `src/hook/useAddClientModal.tsx`
- [ ] `src/hook/useStatusMessage.tsx`

## `src/lib/`

- [ ] `src/lib/acceptProposal.ts`
- [ ] `src/lib/cn.ts`
- [ ] `src/lib/format.ts`
- [ ] `src/lib/getFriendlyError.ts`
- [ ] `src/lib/notify.ts`
- [ ] `src/lib/portalToken.ts`
- [ ] `src/lib/sanitize.ts`
- [ ] `src/lib/sanitizeRichText.ts`
- [ ] `src/lib/toMessageText.ts`

## `src/schema/`

- [ ] `src/schema/client.ts`
- [ ] `src/schema/proposal.ts`

## `src/server/`

- [ ] `src/server/db.ts`

## `src/server/api/`

- [ ] `src/server/api/root.ts`
- [ ] `src/server/api/trpc.ts`

## `src/server/api/routers/`

- [ ] `src/server/api/routers/account.ts`
- [ ] `src/server/api/routers/client.ts`
- [ ] `src/server/api/routers/clientPortal.ts`
- [ ] `src/server/api/routers/notification.ts`
- [ ] `src/server/api/routers/portal.ts`
- [ ] `src/server/api/routers/project.ts`
- [ ] `src/server/api/routers/proposal.ts`
- [ ] `src/server/api/routers/settings.ts`

## `src/server/better-auth/`

- [ ] `src/server/better-auth/client.ts`
- [ ] `src/server/better-auth/config.ts`
- [ ] `src/server/better-auth/index.ts`
- [ ] `src/server/better-auth/server.ts`

## `src/styles/`

- [ ] `src/styles/globals.css`

## `src/trpc/`

- [ ] `src/trpc/query-client.ts`
- [ ] `src/trpc/react.tsx`
- [ ] `src/trpc/server.ts`

## `src/type/`

- [ ] `src/type/addClientModal.ts`
- [ ] `src/type/client.ts`
- [ ] `src/type/index.ts`
- [ ] `src/type/plan.ts`
- [ ] `src/type/project.ts`
- [ ] `src/type/proposal.ts`
- [ ] `src/type/setting.ts`
- [ ] `src/type/statusMessage.ts`

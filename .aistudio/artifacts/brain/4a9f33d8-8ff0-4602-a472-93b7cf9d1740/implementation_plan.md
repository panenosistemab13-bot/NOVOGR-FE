# UI Overhaul Implementation Plan

## Overview
Rebuild the application interface to match the high-fidelity logistics dashboard provided.

## Phase 1: Structural Changes
- Update `src/App.tsx` to a grid-based dashboard layout:
  - Sidebar (left, fixed width)
  - Header (top, full width)
  - Main Content Area (grid of cards and panels)
  - Right Panel (fixed width, vertical stats)

## Phase 2: Component Implementation
- Create `src/components/Sidebar.tsx`
- Create `src/components/Header.tsx`
- Create `src/components/Dashboard.tsx`
- Create `src/components/RightPanel.tsx`
- Implement reusable Card/Panel components with Tailwind CSS following the 60-30-10 rule and strict typography.

## Phase 3: Visual Polish & Styling
- Apply dark theme and color palette to `styles.css`.
- Integrate `hero_banner_logistic_1790432361805.jpg` in the main hero card.
- Implement responsive layout ensuring no overflow on 1440px desktop.

## Phase 4: Verification
- Run `compile_applet` to check for build errors.
- Verify component interaction handlers.

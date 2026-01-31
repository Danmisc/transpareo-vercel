# Manual Verification Plan - Community System

## Overview
This plan verifies the new dedicated community layout, sidebar navigation, detail view redesign, and post creation integration.

## Tests

### 1. Navigation Structure
- [ ] **Sidebar Visibility**: Navigate to `/communities` and ensure the `CommunitySidebar` is visible on the left.
- [ ] **Home Link**: Click "Back to Home" (arrow icon) in sidebar. Should navigate to `/`.
- [ ] **Discovery Page**: Verify `/communities` shows the grid of communities.
- [ ] **Responsive Check**: On mobile view, verify sidebar behavior (it should be hidden by default on detail view, or handled via layout logic).

### 2. Community Detail View
- [ ] **Header Appearance**: Navigate to `/communities/[slug]`. Verify the new glassmorphism header, cover image, and stats.
- [ ] **Tabs Interaction**: Click through "Publications", "À propos", "Membres". ensure smooth transitions.
- [ ] **Visual Consistency**: Ensure the background ambient gradient is visible (`radial-gradient`).

### 3. Post Creation
- [ ] **Editor Expand**: Click on "Quoi de neuf...". Editor should expand.
- [ ] **Post Type**: Select "Poll" or "Image". Verify specific inputs appear.
- [ ] **Publish**: Attempt to publish a simple text post. Verify success toast. (Note: Requires backing server actions).
- [ ] **Context**: Verify the post is associated with the current community (via `communityId`).

### 4. Admin/Mod Features
- [ ] **Members Tab**: Search for a member. Verify Admin badges appear.
- [ ] **About Tab**: Verify Stat Cards are correctly populated.

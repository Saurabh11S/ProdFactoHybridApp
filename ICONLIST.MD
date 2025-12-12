Icon list (core) — filenames + purpose

Navigation / Global

ic-home.svg — bottom nav Home

ic-services.svg — bottom nav Services

ic-shorts.svg — bottom nav Shorts (active variant ic-shorts-active.svg)

ic-wallet.svg — bottom nav Wallet

ic-profile.svg — bottom nav Profile

ic-search.svg — search field

ic-back.svg — top-left back arrow

ic-more.svg — top-right overflow / more

Primary Actions

ic-cta-primary.svg — large CTA icon (optional)

ic-share.svg — share action (important: single visible on Shorts)

ic-play.svg — course/shorts play

ic-pause.svg — pause state

Shorts / Player (single share-only variant)

ic-share-circle.svg — circular share icon (48dp)

ic-progress-indicator.svg — small progress marker (use progress bar image instead of icon)

ic-channel-avatar-placeholder.svg — default avatar

Learning / Courses

ic-course-tax.svg — course icon (tax)

ic-course-gst.svg — course icon (GST)

ic-course-invest.svg — course icon (investments)

ic-course-business.svg — course icon (business incorporation)

ic-badge-completed.svg — Completed badge (green pill)

ic-badge-inprogress.svg — In-progress badge (gradient pill)

Services / Cards

ic-service-gst.svg

ic-service-itr.svg

ic-service-taxplan.svg

ic-service-registration.svg

ic-service-outsourcing.svg

ic-chevron-right.svg — for navigations inside cards

Auth / Misc

ic-email.svg — email field icon

ic-lock.svg — password field icon

ic-phone.svg — phone / OTP input

ic-google.svg — Google sign-in

ic-facebook.svg — Facebook sign-in

ic-bell.svg — notifications

ic-download.svg — (optional) download/save

System / Small UI

ic-close.svg — modal close

ic-check.svg — small check for features

ic-calendar.svg — date / deadlines

ic-wallet-small.svg — small wallet icon for rows

App Icon (launcher)

app-icon-adaptive.svg — adaptive icon source (foreground + background layers)

app-icon-legacy.png — raster legacy sizes (optional)

Variants & color rules

Provide each icon in 3 variants unless noted:

Filled (white) — ic-name-filled.svg — single-color white, for on-accent surfaces.

Outline (stroke) — ic-name-outline.svg — stroke icons (2px stroke recommended).

Accent / Colored — ic-name-accent.svg — gradient or solid accent (for course thumbnails or prominent CTAs).

Examples:

ic-share.svg → ic-share-outline.svg (default on dark glass), ic-share-accent.svg (used in active states).

Bottom nav active icons: provide ic-shorts-active.svg (accent filled) and ic-shorts.svg (muted outline).

SVG authoring rules (designer checklist)

ViewBox: 0 0 24 24 (standard) or 0 0 48 48 when a larger baseline is necessary. Use consistent viewBox across same-type icons.

Use no hard-coded fill colors for the white/outline variants — use currentColor so the app can tint icons via CSS/Compose easily.

Example: <path fill="currentColor" d="..."/>

Use strokes for outline icons with stroke-linecap="round" and stroke-linejoin="round".

Stroke width: 1.5–2.0 px (scaled appropriately).

Avoid embedded raster images inside SVGs.

Add aria-label or title element for accessibility where appropriate.

Optimize SVGs (SVGO) before delivery.

Raster export sizes (Android) — if you want PNG fallback

Provide PNG exports at these densities (px) for 24dp baseline icons:

Density	Scale	24dp icon (px)	48dp icon (px)
mdpi	1x	24×24	48×48
hdpi	1.5x	36×36	72×72
xhdpi	2x	48×48	96×96
xxhdpi	3x	72×72	144×144
xxxhdpi	4x	96×96	192×192

Recommended baseline sizes (DP) for key elements:

Bottom nav icons: 24dp (use 24dp SVG)

Share circle button: 48dp

Channel avatar: 36dp (use 64px export for raster thumbnail)

Course thumbnail: 512×512 (SVG or PNG)
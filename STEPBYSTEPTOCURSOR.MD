4) Component specs (glass-first)

Below are the main components Cursor AI needs to generate:

A) GlassCard (list / service card)

Width: match_parent - 32dp (padding 16dp each side)

Corner radius: 24dp

Background: surfaceGlass with backdrop-filter: blur(22px) (Android: RenderScript/BlurView or Compose Modifier.graphicsLayer + blur)

Inner stroke: 1px glassStroke

Padding: 18dp

Shadow: card shadow

Content: icon (48dp), title (18sp), subtitle (14sp), arrow chevron right

B) Pill Filter (category chips)

Height: 40dp

Padding horizontal: 18dp

Radius: pill 28dp

Active state: gradient fill (cta gradient), glowing outline

Inactive: glass tint background + 1px stroke

C) Primary Button (CTA)

Height: 56dp

Radius: 24dp

Background: Brush.horizontalGradient(accentStart->accentEnd)

Text: 16sp, SemiBold, White

Elevation: 8dp + soft glow

D) Secondary Button

Same size but transparent glass background with stroke; text uses textPrimary or mutedOnGlass

E) Bottom Navigation (glass dock)

Height: 72dp

Background: surfaceGlass with high blur

Active item: filled circle (accent gradient) with icon inside, label below 10sp

F) Shorts Player (special)

Fullscreen video area.

Progress bar: 4dp height, full width, gradient fill (accentStart->accentEnd).

Bottom-left channel pill: glass card, icon 36dp, name, views.

Right side: only Share icon (48dp circular glass button). On tap, open share sheet; no likes/comments.

Tap video to pause/resume.

Swipe up/down to change video (Pager).

G) Learning Cards (library & list)

Grid (2 columns) in library; cards 48% width, corner 20–24dp

List view: full-width glass list items (see earlier generated UI)

Course card content: icon, title (20sp), level + duration (12–14sp), small progress bar if started

Badge variant: Completed (green with white text), In Progress (gradient pill)
********************************************************************************
Android mapping — colors.xml + Jetpack Compose theme
colors.xml (example)
<resources>
    <color name="bg_start">#08112B</color>
    <color name="bg_end">#5A2EA6</color>
    <color name="accent_start">#00E0FF</color>
    <color name="accent_end">#7A4DFF</color>
    <color name="primary_cta">#57B8FF</color>
    <color name="text_primary">#FFFFFF</color>
    <color name="text_muted">#B3B3B3</color>
    <color name="glass_tint">#0FFFFFF (or use alpha)</color>
</resources>

Jetpack Compose Theme.kt (concise)
private val LightColorPalette = lightColors(
    primary = Color(0xFF57B8FF),
    onPrimary = Color.White,
    background = Color(0xFF08112B),
    surface = Color(0x0AFFFFFF),
    onSurface = Color.White
)

// tokens mapping done from tokens.json
@Composable
fun GlassoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = LightColorPalette,
        typography = Typography(
            h1 = TextStyle(fontFamily = Inter, fontSize = 34.sp, fontWeight = FontWeight.Bold, color = Color.White),
            body1 = TextStyle(fontFamily = Inter, fontSize = 16.sp, color = Color.White.copy(alpha = 0.9f))
        ),
        shapes = Shapes(
            small = RoundedCornerShape(12.dp),
            medium = RoundedCornerShape(20.dp),
            large = RoundedCornerShape(28.dp)
        ),
        content = content
    )
}

Glass effect in Compose

Use Modifier.drawWithCache + graphicsLayer or Blur effect if Compose & Android 12+; otherwise use third-party BlurView or RenderScript/RenderEffect to achieve backdrop blur for glass panels.
*****************************************************************************
Figma & asset structure (how Cursor AI expects it)

Figma page & naming convention

Page: Design System

Frame: Tokens (colors, gradients, shadows)

Frame: Typography (H1, H2, Body, Caption)

Frame: Components (Buttons, Cards, Chips, Nav, ShortsControls)

Page: Screens

Home/Glass

Login/Glass

Signup/Glass

Services/Glass

Shorts/Player/Glass

Updates/Glass

Learning/Library/Glass

Each frame artboard: 1080 x 2400 px, named exactly as the files you’ll provide.

Export assets

SVG icons (24/28/32 px) — name: ic_share.svg, ic_back.svg, ic_play.svg, ic_home.svg etc.

PNG thumbnails for courses: course_tax_deductions.png at 512×512

Background gradient as vector or 2x PNG bg_gradient@2x.png (1080×2400 or 1240×2688 if used)
*****************************************************************
Step-by-step: Hand-off to Cursor AI

Create a ZIP named facto_design_pack.zip including:

tokens.json (as above)

components.json (as above)

cursor_manifest.json (as above)

screens/ PNG artboards (1080×2400) — file names must match manifest

assets/icons/ (SVGs)

assets/images/ (course thumbnails)

Upload the ZIP to Cursor AI and select Platform: Android and Style: Jetpack Compose (if available).

Point Cursor AI to cursor_manifest.json — this tells it tokens, components and screens to map.

In Cursor AI, choose options:

Generate theme: ON

Create Compose components: ON

Map screens to routes: ON (it will generate NavHost scaffolding)

Review the generated code (Cursor AI often produces a Theme.kt, Tokens.kt, and screen composables).

Replace video placeholders with ExoPlayer code as needed (I can provide this if required).
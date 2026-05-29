1. Target Audience
The primary user is an 18–25 year old Gen-Z or Gen Alpha driver for whom the car is a self-expression medium. Sharing a RouteFlex card to a close friends circle on Instagram Stories or Snapchat is the social ritual — the drive is the event, the card is the receipt. Their core motivation is intimate validation from a specific in-group, not broadcast performance.

2. Unconventional User Observations

The Re-sharer as Hype Crew: When a driver posts a card to their close friends, a passenger who was physically in that car will reshare it — but the card credits only the driver. The passenger's identity in the shared moment is erased. Left unaddressed, this quietly frustrates a segment that will eventually stop engaging with the product entirely.
The Template as Identity Signal: Users pick a template based on their current aesthetic era, not based on what renders best with their stats. A user deep in their Y2K phase will never touch Neon Cyberpunk. Template selection is a personal branding decision, and the inability to customize within a template creates dissatisfaction that reads as a product gap.
The Dead-Air Drive: A significant share of drives happen in silence, with a podcast, or with a voice note running. When the Spotify field is empty or irrelevant the card feels visually incomplete, and users either skip sharing or leave a blank field that breaks the aesthetic. Music is not universal to every drive worth flexing.


3. Proposed Features
V1 — Launch

Feature Name: Caption Tone Selector
Description: Present three tone chips — Hype, Poetic, Unhinged — before Groq generation, each steering the system prompt toward a distinct voice.
Audience Fit: Caption personality is the primary differentiator between cards in a close-friends feed; giving tone control increases perceived ownership of the artifact.
Complexity: Low

Feature Name: Custom Listening Field
Description: Replace the Spotify-only badge with a freeform "Listening To" input accepting any text — podcast name, playlist title, silence, or a custom string — rendered as the audio line on the card.
Audience Fit: Directly solves the dead-air drive problem; every drive becomes shareable regardless of whether Spotify was active.
Complexity: Low

Feature Name: Smoothness Score Breakdown Tooltip
Description: A single-tap overlay on the card preview screen that surfaces the sub-signals (acceleration variance, hard braking events, lateral G contribution) behind the smoothness score.
Audience Fit: Gives repeat users a concrete target to optimize between drives, deepening the engagement loop without requiring social infrastructure.
Complexity: Low

Feature Name: Template Accent Customization
Description: Within each template, expose a single accent color picker — four preset swatches plus a hex input — overriding the primary highlight color without altering the template's structural layout.
Audience Fit: Addresses the Template as Identity Signal pattern directly; users locked into one template can still make the card feel distinctly theirs.
Complexity: Medium

Feature Name: Drive History Dashboard
Description: A personal archive — internally called Motion Memorandum — listing all past drives with stats, template used, and a one-tap option to reshare any card through the Web Share API.
Audience Fit: Supabase persistence is already live, making this the Spotify Wrapped payoff that rewards return users and gives the app a reason to reopen outside of active drives.
Complexity: Medium

Feature Name: Drive Streak Counter
Description: Track consecutive days with at least one generated card; surface the streak as a subtle badge on the card and inside the history dashboard.
Audience Fit: Streak mechanics are native to Gen-Z's app vocabulary — Duolingo, Snapchat — and generate habitual re-engagement without requiring a social graph.
Complexity: Medium

V2 — First Post-Launch Drop

Feature Name: Passenger Co-Crediting (Hype Crew)
Description: At trip end the driver displays a QR code; any passenger who scans it receives the identical flex card added to their own Drive History with no separate tracking required.
Audience Fit: The single strongest organic growth loop in the product — scanning forces account creation and gives passengers a stake in the shared social moment.
Complexity: High

Feature Name: Retro Template Swap
Description: From Drive History, any past trip can be re-rendered through a newly released template using persisted telemetry — no re-driving required.
Audience Fit: Rewards early users when new templates drop and gives each V2 template release a concrete pull mechanism back into the app.
Complexity: Medium

.app-shell {
  min-height: 100svh;
  max-width: 430px;
  margin: 0 auto;
  background: var(--bg);
  color: var(--text);
  position: relative;
  border-inline: 1px solid var(--border);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(13, 13, 13, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--text);
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--accent);
  color: #0d0d0d;
  font-family: var(--display);
  font-weight: 900;
}

.brand strong,
h1,
h2 {
  font-family: var(--display);
  text-transform: uppercase;
}

.brand small,
.muted,
.fine-print,
.empty-mini {
  color: var(--muted);
}

main {
  padding-bottom: 90px;
}

.screen {
  padding: 18px 14px 22px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-band {
  min-height: 178px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 2px 22px;
}

.hero-copy {
  max-width: 34ch;
  margin-top: 10px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.35;
}

.hero-band.compact {
  min-height: 118px;
}

h1 {
  margin: 6px 0 0;
  color: var(--text);
  font-size: clamp(38px, 12vw, 56px);
  line-height: 0.9;
  letter-spacing: 0;
}

h2 {
  margin: 0;
  color: var(--text);
  font-size: 20px;
  line-height: 1;
  letter-spacing: 0;
}

p {
  margin: 0;
}

.eyebrow {
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card,
.empty-state,
.metric,
.workout-card,
.program-pill,
.saved-workout {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.card,
.empty-state {
  padding: 14px;
}

.empty-state {
  min-height: 220px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12px;
  text-align: center;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.coach-brief {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(200, 255, 0, 0.45);
  border-radius: 8px;
  background: #111;
  padding: 12px;
}

.coach-brief p:not(.eyebrow) {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
  margin-top: 6px;
}

.helper-note,
.reminder-row,
.instruction-card,
.history-strip {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 10px;
}

.helper-note,
.reminder-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
}

.helper-note svg,
.reminder-row svg {
  flex: 0 0 auto;
  color: var(--accent);
  margin-top: 1px;
}

.reminder-panel {
  display: grid;
  gap: 8px;
}

.readiness-list {
  display: grid;
  gap: 8px;
}

.readiness-list span {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
}

.readiness-list svg {
  flex: 0 0 auto;
  color: var(--accent);
  margin-top: 1px;
}

.reminder-row span {
  display: grid;
  gap: 2px;
}

.reminder-row strong {
  color: var(--text);
}

.proof-strip,
.starter-grid,
.value-ladder {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.proof-strip span,
.starter-grid span {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #111;
  color: var(--muted);
  padding: 7px 9px;
  font-size: 12px;
  font-weight: 800;
}

.starter-grid {
  justify-content: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.demo-grid div {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 9px;
  display: grid;
  gap: 4px;
  text-align: left;
}

.demo-grid strong {
  color: var(--text);
  font-size: 13px;
}

.demo-grid span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.25;
}

.value-ladder {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.value-ladder div {
  min-height: 82px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 10px;
  display: grid;
  gap: 6px;
}

.value-ladder strong {
  color: var(--accent);
  font-size: 18px;
}

.value-ladder span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.25;
}

.metric {
  min-height: 86px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
}

.metric svg {
  color: var(--accent);
}

.metric span,
.section-title span,
small {
  color: var(--muted);
  font-size: 12px;
}

.metric strong {
  color: var(--text);
  font-size: 22px;
}

.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.button-row,
.inline-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.primary,
.secondary,
.icon-button,
.text-button,
.danger-link {
  min-height: 40px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.primary {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #0d0d0d;
  font-weight: 900;
}

.secondary {
  border: 1px solid var(--border);
  background: #222;
  color: var(--text);
  padding: 0 12px;
}

.full {
  width: 100%;
}

.icon-button {
  width: 40px;
  border: 1px solid var(--border);
  background: #222;
  color: var(--text);
}

.text-button,
.danger-link {
  border: 0;
  background: transparent;
  color: var(--accent);
  padding: 0;
}

.danger-link {
  color: var(--danger);
}

.callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.achievement {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--muted);
}

.achievement.done {
  color: var(--accent);
  border-color: rgba(200, 255, 0, 0.45);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #1a1a1a;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
}

.segmented button {
  height: 38px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
}

.segmented .active {
  background: var(--accent);
  color: #0d0d0d;
  font-weight: 900;
}

.flow-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 14px;
}

.flow-header h1 {
  font-size: clamp(34px, 10vw, 48px);
}

.plan-preview,
.coach-card {
  border-color: rgba(200, 255, 0, 0.34);
  background: linear-gradient(180deg, rgba(200, 255, 0, 0.07), #111 56%);
}

.coach-card {
  border: 1px solid rgba(200, 255, 0, 0.34);
  border-radius: 8px;
  padding: 12px;
}

.coach-card p:not(.eyebrow) {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.38;
  margin-top: 6px;
}

.coach-card small {
  display: block;
  margin-top: 8px;
  color: var(--text);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.preview-grid div {
  border: 1px solid var(--border);
  border-radius: 7px;
  background: #111;
  padding: 9px;
  display: grid;
  gap: 4px;
}

.preview-grid span,
.review-grid span,
.progress-track button,
.insight-grid span,
.analytics-grid span,
.instruction-card span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.preview-grid strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.25;
}

.progress-track {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.progress-track button {
  flex: 1 0 auto;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #111;
  padding: 7px 9px;
  text-align: center;
}

.progress-track .active {
  border-color: var(--accent);
  color: var(--accent);
}

.progress-track .done {
  border-color: rgba(34, 197, 94, 0.5);
  color: var(--success);
}

.wizard-card {
  gap: 16px;
}

.wizard-actions {
  position: sticky;
  bottom: 78px;
  z-index: 4;
  display: grid;
  grid-template-columns: 0.75fr 1.25fr;
  gap: 8px;
  padding-top: 8px;
  background: linear-gradient(180deg, transparent, var(--card) 28%);
}

.field-grid,
.review-grid,
.insight-grid,
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.review-panel {
  display: grid;
  gap: 12px;
}

.review-hero,
.review-week,
.review-grid div,
.insight-grid div,
.analytics-grid div {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 10px;
}

.review-hero p:not(.eyebrow) {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
  margin-top: 6px;
}

.review-grid div,
.insight-grid div,
.analytics-grid div,
.instruction-card {
  display: grid;
  gap: 4px;
}

.review-grid strong,
.insight-grid strong,
.analytics-grid strong,
.instruction-card strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.25;
}

.analytics-grid small,
.instruction-card small {
  color: var(--muted);
  line-height: 1.25;
}

.trust-grid {
  display: grid;
  gap: 7px;
}

.trust-grid span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 12px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.form-stack label,
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: #111;
  color: var(--text);
  padding: 11px;
}

.check-group {
  border: 0;
  padding: 0;
  margin: 0;
}

.check-group legend {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.check-group > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.check-chip {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #111;
  padding: 0 10px;
}

.check-chip input {
  width: auto;
  accent-color: var(--accent);
}

.check-chip:has(input:checked) {
  border-color: var(--accent);
  color: var(--accent);
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.program-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.program-pill {
  min-width: 180px;
  padding: 10px;
  color: var(--text);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.program-pill.active {
  border-color: var(--accent);
}

.roadmap {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.roadmap-groups {
  display: grid;
  gap: 10px;
}

.roadmap-group {
  display: grid;
  gap: 7px;
}

.roadmap-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.roadmap-label strong {
  color: var(--text);
}

.roadmap-label span {
  color: var(--muted);
  font-size: 12px;
}

.week-dot {
  min-height: 44px;
  border: 1px solid var(--border);
  border-top: 3px solid var(--phase);
  border-radius: 7px;
  background: #1a1a1a;
  color: var(--text);
  padding: 6px 4px;
  text-align: center;
}

.week-dot.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(200, 255, 0, 0.35);
}

.week-dot span,
.week-dot small {
  display: block;
}

.banner,
.error {
  border-radius: 7px;
  padding: 10px;
}

.banner {
  color: #0d0d0d;
  background: var(--warning);
}

.banner.subtle {
  color: var(--text);
  background: #222;
  border: 1px solid rgba(200, 255, 0, 0.35);
}

.profile-fit {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.profile-fit div {
  min-height: 54px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: #111;
  padding: 8px;
  display: grid;
  align-content: start;
  gap: 4px;
}

.profile-fit span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.profile-fit strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.2;
}

.error {
  color: #fff;
  background: var(--danger);
}

.error p + p {
  margin-top: 4px;
}

.privacy-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  color: var(--muted);
  padding: 10px;
  font-size: 12px;
}

.privacy-strip svg {
  flex: 0 0 auto;
  color: var(--accent);
}

.workout-card {
  border-left: 4px solid var(--accent-card);
  padding: 10px;
}

.workout-card > summary,
.saved-workout > button:first-child {
  width: 100%;
  color: var(--text);
  background: transparent;
  border: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 0 8px;
}

.workout-card > summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  list-style: none;
  cursor: pointer;
}

.workout-card > summary::-webkit-details-marker {
  display: none;
}

.workout-card > summary strong,
.workout-card > summary small {
  display: block;
}

.mini {
  min-height: 34px;
  padding: 0 10px;
  font-size: 12px;
}

.exercise-preview {
  min-height: 38px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 8px;
}

.exercise-preview div {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.exercise-preview span {
  overflow-wrap: anywhere;
}

.exercise-preview-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.instruction-dialog {
  max-height: min(86svh, 760px);
  overflow-y: auto;
}

.instruction-hero,
.instruction-block,
.safety-callout {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 10px;
}

.instruction-hero h2 {
  margin: 4px 0 0;
}

.instruction-hero small {
  display: block;
  margin-top: 6px;
  color: var(--muted);
}

.instruction-meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.instruction-media {
  margin: 0;
  border: 1px solid rgba(200, 255, 0, 0.3);
  border-radius: 8px;
  background: #090909;
  overflow: hidden;
}

.instruction-media img,
.instruction-media video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #111;
}

.instruction-media figcaption {
  border-top: 1px solid var(--border);
  padding: 8px 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.instruction-media.empty-mini {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: var(--muted);
}

.instruction-media.empty-mini svg,
.instruction-media.empty-mini strong {
  color: var(--accent);
}

.instruction-media-placeholder {
  min-height: 132px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px rgba(200, 255, 0, 0.18);
}

.demo-icon {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #0d0d0d;
}

.instruction-media-placeholder strong,
.instruction-media-placeholder span {
  display: block;
}

.instruction-media-placeholder strong {
  color: var(--text);
  font-family: var(--display);
  font-size: 30px;
  line-height: 0.95;
  text-transform: uppercase;
}

.instruction-media-placeholder span {
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
}

.instruction-meta div {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.instruction-meta span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.instruction-meta strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.25;
}

.instruction-block h3 {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 13px;
  text-transform: uppercase;
}

.instruction-block ul,
.instruction-block ol {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  color: var(--muted);
  line-height: 1.35;
}

.safety-callout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-color: rgba(251, 191, 36, 0.5);
}

.safety-callout svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--warning);
}

.list-row {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 8px;
}

.list-row.compact {
  min-height: 32px;
}

.saved-workout {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px;
}

.research-box {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 12px;
}

.research-rule {
  display: grid;
  gap: 4px;
  border-top: 1px solid var(--border);
  padding-top: 9px;
  margin-top: 9px;
}

.research-rule strong {
  color: var(--accent);
}

.research-rule span {
  color: var(--text);
}

.event-dashboard,
.safety-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #111;
  padding: 12px;
}

.event-dashboard > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.event-dashboard > div > div {
  border-top: 1px solid var(--border);
  padding-top: 8px;
  display: grid;
  gap: 4px;
}

.event-dashboard span,
.safety-panel small {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.event-dashboard strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.2;
}

.safety-panel p {
  margin-bottom: 6px;
}

.session-rationale {
  border-top: 1px solid var(--border);
  padding-top: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
}

.superset-badge {
  display: inline-flex;
  align-self: flex-start;
  width: fit-content;
  border: 1px solid rgba(200, 255, 0, 0.45);
  border-radius: 999px;
  color: var(--accent);
  background: #111;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 900;
}

.set-row {
  display: grid;
  grid-template-columns: 54px 1fr 1fr 40px;
  gap: 7px;
  align-items: center;
  margin-top: 8px;
}

.performance-row {
  display: grid;
  grid-template-columns: 1fr 40px;
  gap: 7px;
  align-items: center;
  margin-top: 8px;
}

.quick-log-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.history-strip {
  display: grid;
  gap: 4px;
  color: var(--muted);
  font-size: 12px;
  margin-top: 8px;
}

.exercise-log .instruction-card {
  margin-top: 8px;
}

.quick-log-row .secondary,
.button-row .secondary {
  min-height: 36px;
  font-size: 13px;
}

.timer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-weight: 900;
}

.bar-chart {
  height: 150px;
  display: flex;
  align-items: end;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  padding-top: 16px;
}

.bar {
  flex: 1;
  min-height: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(180deg, var(--accent), #60a5fa);
  border-radius: 6px 6px 0 0;
  color: #0d0d0d;
  font-size: 11px;
  font-weight: 900;
}

.heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.heatmap span {
  aspect-ratio: 1;
  border-radius: 4px;
  background: #222;
  border: 1px solid var(--border);
}

.heatmap .hot {
  background: var(--accent);
}

.inline-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
}

.result {
  border-radius: 8px;
  background: var(--accent);
  color: #0d0d0d;
  padding: 16px;
  font-size: 34px;
  font-weight: 900;
  text-align: center;
}

.plate-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.plate-row span {
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 8px 10px;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
}

.dialog {
  width: min(390px, 100%);
}

.check-row {
  flex-direction: row;
  align-items: center;
}

.check-row input {
  width: auto;
}

.tabbar {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 10;
  width: min(430px, 100%);
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: 1px solid var(--border);
  background: rgba(13, 13, 13, 0.96);
  backdrop-filter: blur(16px);
}

.tabbar button {
  height: 68px;
  border: 0;
  background: transparent;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
}

.tabbar .active {
  color: var(--accent);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 82px;
  z-index: 30;
  transform: translateX(-50%);
  width: min(360px, calc(100% - 32px));
  border-radius: 8px;
  background: var(--accent);
  color: #0d0d0d;
  padding: 12px;
  font-weight: 900;
  text-align: center;
}

.empty-mini {
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 18px;
  text-align: center;
}

@media (min-width: 760px) {
  .app-shell {
    margin-block: 20px;
    min-height: calc(100svh - 40px);
    box-shadow: 0 24px 90px rgba(0, 0, 0, 0.45);
  }
}

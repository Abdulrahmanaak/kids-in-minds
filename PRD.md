**“Atfaluna Amanah (أطفالنا أمانة)”**

---

## 1) Non-negotiables and what they imply

### Key constraints

* **You can’t legally/officially download captions for public videos via YouTube Data API unless the authorized user can edit the video** (i.e., owner/manager). ([Google for Developers][1])
* You must comply with **YouTube API Services Terms / Developer Policies** (no reuploading, follow policy constraints). ([Google for Developers][2])
* Default **YouTube Data API quota is 10,000 units/day**, so you must cache and minimize calls. ([Google for Developers][3])
* Age rating should map to the **Saudi (Gmedia) classification system** (G/PG/PG12/PG15/R15/R18). ([gmedia.gov.sa][4])

### What this means (honestly)

Without creator cooperation, you **won’t reliably get official time-aligned transcripts via API**. So, timestamped evidence must come from **a different mechanism** that does not rely on `captions.download`.

---

## 2) Best workaround architecture: “Parent-Initiated Local Scan”

**Core idea:** Keep your server “clean” (no video/audio storage). If parents want timestamps, they run a **local scan** while the video plays, and you store **only the results**.

### How it works (user-level)

1. Parent opens a video page on **Atfaluna Amanah** (embedded YouTube player).
2. They click **“Scan this video (on my device)”**.
3. The app performs **real-time speech-to-text + classification locally**, producing:

   * Scores (0–10 per axis)
   * Age rating
   * Evidence timestamps (mm:ss–mm:ss) + short neutral notes
4. Parent optionally taps **“Share scan results”** → you upload only:

   * scores + age rating + confidence
   * timestamps + short descriptions
     *(No audio/video upload, no full transcript retention.)*

### Implementation options

* **Option A (fastest MVP):** Desktop Chrome/Edge using **tab capture** (browser permission flow) for audio + on-device ASR.
* **Option B (better UX + more stable):** **Browser extension** to streamline the scan and reduce friction.

> Note: This design avoids using the restricted captions download endpoint. ([Google for Developers][1])
> Also, it reduces platform risk because you’re not rehosting content; you embed YouTube and store only ratings metadata. ([Google for Developers][2])

---

## 3) Product requirements (PRD V1) — “Atfaluna Amanah”

### Goal

Help Saudi parents quickly decide if a YouTube video is suitable for their child, based on **Islamic + Saudi cultural standards**, with **clear evidence timestamps** when available.

### Target user

**Parents** of children in Saudi Arabia.

### MVP scope

* Start with creator teams: **Falcons, Power, Pكس, Lynx, Al-Batabit** (as you listed)
* Import **latest 100 videos** (YouTube normal videos only)
* Features:

  * Search by URL/title
  * Video page + channel page
  * Filters by age rating and axes
  * “Safe for Kids” lists
  * Favorites / Watchlist / Share
  * Submit a video for review
  * Report an incorrect rating (human moderation)

### Two result states (to cover 100 videos quickly)

1. **Unscanned**: No timestamped rating yet → prompts the parent to scan
2. **Scanned**: Full rating + evidence timestamps (from local scans)

---

## 4) Rating system (Rubric + Age Rating Mapping)

### Axes (0–10)

* Profanity/insults
* Music
* Mixed-gender interactions / immodesty
* Sexual innuendo
* Drugs/smoking
* Violence
* Mocking religion
* Gambling
* Sensitive ideas

### 0–10 scale (uniform)

* 0 none
* 1–2 rare/very mild
* 3–4 limited
* 5–6 moderate
* 7–8 high
* 9–10 severe / dominant theme

### Age rating mapping (Saudi-style)

Use: **G / PG / PG12 / PG15 / R15 / R18** ([gmedia.gov.sa][4])

V1 mapping (simple and parent-friendly):

* **G:** all axes ≤ 2
* **PG:** max axis 3–4
* **PG12:** any axis 5–6
* **PG15:** any axis 7–8
* **R15:** any axis = 9
* **R18:** any axis = 10 OR (Sexual innuendo ≥ 9) OR (Mocking religion ≥ 9)

### Confidence

* High: long-enough local scan + clean audio
* Medium: partial scan / moderate audio
* Low: no scan (or extremely short scan)

---

## 5) UX structure (pages + core flows)

### Pages (MVP)

* Home (search + “Safe for Kids” shortcuts + latest imports)
* Search results
* Video page (key page)
* Channel page
* Safe for Kids list builder (age + axes exclusions)
* Favorites + Watchlist
* Submit video
* Report rating
* Admin review dashboard (for reports/submissions)

### Video page states

**Before scan**

* “This video is not scanned yet”
* Big CTA: **Scan on my device**
* Optional: “Show preliminary summary (low confidence)” (can be omitted to avoid misleading)

**After scan**

* Age rating + confidence
* Axis scores (0–10)
* Evidence timestamps (click-to-seek)
* Buttons: Favorite / Watchlist / Share / Report

---

## 6) Data model (updated for local scans)

**Channel**

* id, youtube_channel_id, name, team_tag

**Video**

* id, youtube_video_id, channel_id, title, published_at, duration_sec, thumbnails_json, last_fetched_at

**RatingAggregate** (what you show publicly)

* id, video_id, rubric_version
* age_rating, confidence
* scores_json
* evidence_preview_json
* scans_count, last_updated_at
* status: unscanned | scanned

**ScanRun** (one parent scan)

* id, video_id
* client_type: web_tab_capture | extension
* quality_metrics_json (scan_duration, audio_quality, etc.)
* device_hash (anonymous)
* created_at

**ScanEvidence**

* id, scan_run_id, axis_key, start_ms, end_ms, note

**Submission**

* id, video_url, status, created_at

**Report**

* id, video_id, rating_id, category, message, status, created_at

**ReviewQueue**

* id, item_type, item_id, status, reviewer_note, updated_at

---

## 7) AI pipeline (no channel cooperation)

### Server-side (safe)

* Fetch latest 100 video metadata via YouTube Data API with caching (quota-aware). ([Google for Developers][3])
* Store only metadata + ratings.

### Client-side (local scan)

* Capture tab audio (with user permission) while YouTube plays.
* On-device ASR → timestamped transcript fragments
* Classifier → axis scores + evidence segments
* Upload only: scores + age rating + confidence + timestamps + short notes (no raw audio, no full transcript retention)

### Aggregation (“community builds coverage”)

When multiple parents scan the same video:

* Use **median** per axis (robust to outliers)
* Merge evidence segments if timestamps overlap
* Increase confidence as scan count rises

---

## 8) Architecture options

### Option A (recommended MVP)

* Frontend: Next.js
* Backend: Next.js API routes / Node
* DB: Postgres (Supabase/Neon)
* Cron job: import latest videos daily
* Admin panel: basic internal UI

### Option B (more scalable later)

* Separate worker service for aggregation + moderation tooling
* Queue for processing reports and re-aggregation

---

## 9) Compliance text (ready to paste)

> **Disclaimer:** Atfaluna Amanah (أطفالنا أمانة) provides **guidance only** to help parents. Results may be incomplete or incorrect; the final decision is the guardian’s responsibility. We do **not** reupload YouTube content; videos are displayed via the official embedded player. We store only rating outcomes and timestamped notes, and we follow YouTube API policies and terms. ([Google for Developers][2])

---

## 10) MVP launch checklist + top risks

### Launch checklist

* Import latest 100 videos (quota-aware caching). ([Google for Developers][5])
* Video page supports: scan → rating → timestamps
* Filters: age rating + axes + “Scanned only”
* Submit/report + human review queue
* Clear disclaimer + policy pages

### Top 5 risks + mitigation

1. **Local scan friction** → make scan 1-click, provide extension later
2. **Mobile support** → ship desktop MVP first; mobile later with alternative UX
3. **ASR accuracy (dialects/noise)** → confidence scoring + encourage longer scans
4. **Abuse/spam scans** → device_hash, minimum scan duration, rate limits
5. **Policy/ToS sensitivity** → keep server clean (no media storage), embed only, store ratings metadata, review policies regularly. ([Google for Developers][2])

---

[1]: https://developers.google.com/youtube/v3/docs/captions/download?utm_source=chatgpt.com "Captions: download | YouTube Data API"
[2]: https://developers.google.com/youtube/terms/api-services-terms-of-service?utm_source=chatgpt.com "YouTube API Services Terms of Service"
[3]: https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits?utm_source=chatgpt.com "Quota and Compliance Audits | YouTube Data API"
[4]: https://gmedia.gov.sa/en/age-classification?utm_source=chatgpt.com "General Authority for Media Regulation| Age classification"
[5]: https://developers.google.com/youtube/v3/determine_quota_cost?utm_source=chatgpt.com "Quota Calculator | YouTube Data API"

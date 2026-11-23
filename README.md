> **GitHub full install v3.9.3**: For a complete fresh upload, read [GITHUB_INSTALL_TH.md](GITHUB_INSTALL_TH.md). Set Pages Source to **GitHub Actions**; the workflow builds local satellite.js and deploys current public orbital data every 6 hours when available. Do not upload the ZIP without extracting it.

# USEFUL Acquisition Planner v3.9.3 — Data Integrity Hotfix

**ฐาน UI: v3.9.2 แบบเดิม ไม่เปลี่ยน Layout หรือ Styles**. รายละเอียดการแก้ 5 ประเด็น QA และทดสอบอัตโนมัติ: [Release Notes](RELEASE_NOTES_v3.9.3.md), [QA Report](QA_REPORT_v3.9.3_TH.md) และ [คู่มืออัปเดต](GITHUB_UPDATE_v3.9.3_TH.md).

# USEFUL Acquisition Planner v3.9

**Current version:** All Active Sites calendar by default, Quick Planner for pasted WGS84 coordinates and long Google Maps URLs, collapsible panels, site addition from Selected Location, and Field Planning CSV comparable to the on-site worksheet.

See [Release Notes v3.9](RELEASE_NOTES_v3.9.md) and [Thai GitHub Pages installation guide](GITHUB_INSTALL_TH.md).

# USEFUL Acquisition Planner v3.7

**Latest:** Site categories, THEOS-1 map imagery, improved daily layout, and optional shutter-open Exposure Geometry CSV. Read [v3.7 Release Notes](RELEASE_NOTES_v3.7.md) and [Thai installation guide](GITHUB_INSTALL_TH.md).

# USEFUL Acquisition Planner v3.6

Static Thai/English web application for THEOS Cal/Val acquisition **screening**, lunar/DSNU planning, 2D/3D Earth mapping, preliminary cloud forecasts and SGP4-based satellite position estimates. Designed for GitHub Pages; there is no required server-side database.

## Quick start

Open `index.html` via GitHub Pages (preferred), not directly as `file://`, because browsers restrict local resource loading. See [GITHUB_INSTALL_TH.md](GITHUB_INSTALL_TH.md) for the deployment steps in Thai.

The UI is arranged in one long page: **test sites and map → calendar and DSNU → acquisition opportunities**. Use the main navigation for quick scrolling. Advanced items are in Settings.

### Key functions

- Manage Cal/Val sites and colors, WGS84 latitude/longitude, Active/Inactive status and monthly calendar of candidate passes.
- Manage multiple satellites by NORAD Catalog ID, optional locally pasted TLE/OMM, spacecraft image, Revisit Days and Ground-track Repeat Cycle Days.
- Draw current estimated satellite ground positions and track segments when current orbital elements exist; optionally overlay approximate **Sun/Moon ground-projection points** on 2D and 3D maps.
- Download the normal 8-column acquisition CSV, which is still a *geometric estimate* and not confirmed tasking.
- In **Acquisition Summary → Ground Station / Vicarious Cal/Val**, download the extended **tracking CSV** with geometric AOS/LOS and sample-by-sample antenna Az/El and Sun/Moon geometry.

### How to create the ground tracking CSV

1. Select satellite and either a test site or All Active Sites. Ensure a recent TLE/OMM and bundled `satellite.js` SGP4 support are available.
2. Press **Calculate** and scroll to **Acquisition Summary**.
3. Expand **Ground Station / Vicarious Cal/Val**, set sample interval 10/30/60 seconds and horizon elevation threshold 0/5/10°.
4. Press **Export Tracking CSV**. Values are in UTC and degrees clockwise from true north for azimuth. Rows correspond to time samples between AOS and LOS.
5. For Doppler, configure the downlink frequency (MHz) in **Settings → Satellites**. If not configured, Doppler is blank.

**Tracking export accepts only actual SGP4 events within ±72 hours of the TLE epoch.** It will not fabricate detailed Az/El for long-range 26-day repeat candidates or sites lacking valid coordinates. TLE itself must be current within 72 hours of the export date. AOS/LOS are geometric and exclude terrain, refraction and local station constraints.

### Satellite image upload

In **Settings → Satellites → Edit/Add Satellite**, use **Satellite map image**. Recommended: **transparent PNG or WebP, 128 × 128 pixels**, maximum **1 MB** source file. The browser rescales the file to at most 128 × 128 px and saves a small WebP image in browser localStorage. Use **Export satellites.json** and commit the exported JSON to share the image and settings across browsers.

### Important distinctions

- **Active** means enabled in the catalog. A map position is only possible with sufficiently recent TLE/OMM. Active satellites with missing/stale data appear with **ACTIVE · NO POSITION** in Fleet; use Edit to paste TLE/OMM or update shared `satellites.json` and run Actions.
- **Revisit interval** describes image-acquisition opportunity frequency; it is not necessarily the exact *ground-track repeat cycle*. Only the latter is used by the optional approximate long-term repeat proxy.
- THEOS-2 defaults to a 26-day ground-track repeat cycle. New satellites have no repeat proxy until independently configured.
- **Descending green / Ascending purple** are user-defined planning display colors. They are **not** proof that every descending pass is sunlit or every ascending pass is nighttime. Check actual solar elevation at the target and UTC.
- Sun and Moon map markers are approximated **subsolar/sublunar points on Earth**, not the actual positions of those bodies in space.
- The platform and any CSV must not be used alone for operational antenna steering, radio scheduling, commanded imaging or scientific vicarious calibration acceptance.

### Source references

- Satellite transforms and look-angle definitions: https://github.com/shashwatak/satellite-js/blob/develop/docs/docs/transforms.md
- CelesTrak orbital elements: https://celestrak.org/NORAD/elements/
- NOAA approximate solar calculations: https://gml.noaa.gov/grad/solcalc/solareqns.PDF


## v3.8 — UI / สีและระยะห่าง
เพิ่มไฟล์ `assets/ui-balance-v38.css` เพื่อแยกสี Site Type และ ASC/DESC และจัดข้อมูลใน Daily Inspection / Result Table ให้เป็นระเบียบ อ่านเพิ่มเติมใน `RELEASE_NOTES_v3.8.md`

# USEFUL Acquisition Planner v3.9.3 — FULL GitHub Installation (ภาษาไทย)

**ชุดติดตั้งใหม่ทั้งหมดสำหรับ `usefulspace/calvalplanner`** — ใช้ `index.html` ที่ Root ของ Repository และ **GitHub Actions** สำหรับ Build/Deploy + อัปเดตข้อมูลวงโคจร

## ก่อนติดตั้ง
- ZIP นี้ **ต้องแตกไฟล์ก่อนอัปโหลด** ห้ามอัปโหลด ZIP เข้า GitHub เป็นไฟล์เดียว เพราะ GitHub Pages ไม่แตก ZIP ให้
- หลังแตก ZIP ต้องเห็นไฟล์ `index.html`, `sites.json`, `satellites.json` และโฟลเดอร์ `assets/`, `data/`, `scripts/`, `tests/`, `.github/workflows/` อยู่ระดับเดียวกัน
- ห้ามวางโฟลเดอร์แม่ครอบทุกไฟล์ใน Repository เช่น `calvalplanner/USEFUL_Acquisition_Planner_v3.9.3_GITHUB_FULL_INSTALL/index.html` เพราะจะทำให้ URL เดิมเปิดไม่ได้
- ระบบวงโคจรในชุดนี้ไม่ได้แนบ TLE/OMM ที่สมมติขึ้น ระบบจะดึงข้อมูลปัจจุบันโดย GitHub Actions และแสดงดาวเทียมเฉพาะที่มี Epoch อายุไม่เกิน 72 ชั่วโมง
- แนะนำสำรองไฟล์ `sites.json` / `satellites.json` เดิมก่อนอัปโหลด เพราะข้อมูลที่เคยแก้บนเว็บอาจอยู่ใน localStorage ของเบราว์เซอร์เท่านั้น

## วิธีติดตั้งใหม่ (แนะนำ GitHub Desktop เพราะไม่ทำไฟล์ `.github` และโฟลเดอร์ย่อยตกหล่น)
1. แตก ZIP ลงโฟลเดอร์ใน Windows เช่น `C:\calvalplanner-new` (ดูให้แน่ใจว่า `index.html` อยู่ในโฟลเดอร์ที่เปิดนี้โดยตรง)
2. เปิด GitHub Desktop → File → Clone repository → URL: `https://github.com/usefulspace/calvalplanner` → Clone
3. **สำรองเนื้อหา Repository เดิมก่อน** โดยเฉพาะ `sites.json` / `satellites.json` ที่ปรับเอง จากนั้นในโฟลเดอร์ Repository ที่ Clone มา **ลบไฟล์/โฟลเดอร์เดิมทั้งหมด ยกเว้น `.git`** (ห้ามลบ `.git` เพราะใช้เก็บการเชื่อมต่อกับ GitHub) แล้วคัดลอก **เนื้อหา** จากโฟลเดอร์ที่แตก ZIP มาวางแทนทั้งหมด วิธีนี้ป้องกัน Workflow รุ่นเก่าซ้ำซ้อน และรักษาโครงสร้างไดเรกทอรีถูกต้อง
4. ตรวจให้แน่ใจว่า `.github/workflows/update-orbit-assets.yml`, `scripts/refresh_orbits.py`, `assets/fleet.js`, `assets/orbit.js` และ `index.html` อยู่ครบ
5. ใน GitHub Desktop: Summary เช่น `Full install v3.9.3 with orbit auto-deployment` → Commit to main → Push origin
6. เปิด `https://github.com/usefulspace/calvalplanner/settings/pages` → Build and deployment → Source = **GitHub Actions** (ไม่ใช่ `Deploy from a branch`)  
7. เปิดแท็บ Actions → เลือก `USEFUL Planner - Refresh Orbits and Deploy Pages` → Run workflow (หากอัปโหลดแล้วไม่รันเอง)
8. เมื่อ `build` และ `deploy` เป็นสีเขียว เปิด `https://usefulspace.github.io/calvalplanner/` แล้วกด Ctrl+Shift+R

## หากต้องการอัปโหลดผ่านหน้าเว็บ GitHub โดยไม่ใช้ Desktop
1. เปิด Repository → `Add file` → `Upload files` บน Branch `main`
2. แตก ZIP ก่อน แล้วลาก **ไฟล์และโฟลเดอร์ทั้งหมดที่อยู่ภายใน ZIP** ไปวางในหน้า Upload (ไม่ลากตัว ZIP หรือโฟลเดอร์แม่)
3. ตรวจรายการไฟล์ก่อน Commit ต้องมี `assets/...`, `data/...`, `scripts/...` และ `.github/workflows/update-orbit-assets.yml` รวมทั้ง `index.html` **ที่ Root**
4. หน้าเว็บแบบ Upload จะไม่ลบไฟล์เดิมที่ไม่อยู่ใน ZIP ให้ ตรวจและลบ Workflow รุ่นเก่าที่ซ้ำกัน เช่น `.github/workflows/deploy-calval-orbits.yml` หากเคยสร้างไว้ เพราะอาจทำให้มีหลาย Workflow Deploy แข่งขันกัน
5. กด Commit changes แล้วทำข้อ 6–8 จากวิธี GitHub Desktop; ถ้าเว็บไม่รักษาโครงสร้างโฟลเดอร์ หรือไม่เห็น `.github` ให้ใช้ GitHub Desktop แทน

## การทำงานของ Orbit
- Workflow จะสร้าง `assets/vendor/satellite.min.js` จาก satellite.js 6.0.2 (MIT) และดาวน์โหลด OMM/TLE จาก CelesTrak ตาม NORAD ID ใน `satellites.json`
- ข้อมูลที่ดาวน์โหลดจะถูกใส่ใน **เว็บไซต์ที่ Deploy** ภายใต้ `data/satellites/<NORAD>.json` และ `data/orbit_status.json` ไม่จำเป็นต้องมีไฟล์นี้ใน Source Repository
- ตั้งเวลาทำงานทุก 6 ชั่วโมง (GitHub อาจเลื่อนเวลางาน Schedule และอาจหยุด Schedule หาก Repository ไม่มีกิจกรรมเป็นเวลานาน)
- ถ้า CelesTrak ไม่มีข้อมูลล่าสุด/เชื่อมต่อไม่ได้ เว็บยังใช้งานส่วนอื่นได้ แต่ดาวเทียมที่ไม่มี TLE/OMM ล่าสุดจะขึ้น `ACTIVE · NO POSITION` โดยไม่สร้างตำแหน่งเทียม
- ใช้ข้อมูล public GP/OMM + SGP4 เพื่อประมาณตำแหน่ง ไม่ใช่ telemetry จริงหรือข้อมูลยืนยันการสั่งถ่ายภาพ

## วิธีตรวจสอบหลังติดตั้ง
1. เปิด `https://usefulspace.github.io/calvalplanner/` ทดสอบแผนที่และจุด Cal/Val
2. เปิด `https://usefulspace.github.io/calvalplanner/data/orbit_status.json` ดู `active_fresh`, `active_total`, `epoch_utc` และ `status` สำหรับ THEOS-1/2
3. เปิด `https://usefulspace.github.io/calvalplanner/assets/vendor/satellite.min.js` ต้องไม่เป็น 404
4. เปิด Actions → Workflow ล่าสุด → ดู `Report fresh orbit availability and generate public status` เพื่อทราบว่าดวงใดมีข้อมูลใช้ได้
5. ถ้า Actions ล้มเหลว ให้เปิด Job `build` ที่มีเครื่องหมายแดงเพื่ออ่าน Log; การอัปโหลดขึ้น GitHub สำเร็จไม่ได้รับประกันการทำงานของข้อมูลวงโคจร

## ถ้ายังไม่เห็นดาวเทียม
- `active_fresh: 0` = ไม่มี OMM/TLE ที่มีอายุไม่เกิน 72 ชั่วโมง หรือดาวน์โหลดไม่สำเร็จ ต้องตรวจ CelesTrak/Actions ห้ามใช้ข้อมูลเก่าแสดงเป็นตำแหน่งปัจจุบัน
- `active_fresh >= 1` แต่เว็บยัง 0 = ลอง Hard Refresh และดู Console (F12) ว่ามี 404/Script error หรือไม่
- จุดที่เคยขึ้นบนคอมพิวเตอร์อาจอาศัย localStorage ที่ไม่ถูกส่งไป GitHub
- ให้ตรวจว่าตั้ง Pages เป็น `GitHub Actions` จริง ไม่ใช่ `Deploy from a branch`, เพราะโหมดเดิมจะไม่เห็นไฟล์ที่ Build สร้างขึ้น

## หมายเหตุ
- ZIP นี้คง `index.html`, `assets/` และ `sites.json` ของต้นฉบับ v3.9.3 ตามที่ผู้ใช้ส่งมา ไม่เปลี่ยน Layout
- ไม่มีการเข้าถึงบัญชี GitHub เพื่อกด Deploy แทนผู้ใช้ และไม่ได้ดึง TLE/OMM จริงมาบรรจุใน ZIP เพราะสภาพแวดล้อมจัดทำ ZIP ไม่สามารถเข้าถึงบริการภายนอกได้
- ไฟล์ ZIP จัดเตรียมให้พร้อมอัปโหลดและทดสอบแบบไม่ใช้เครือข่ายแล้ว แต่ผลรันจริงของ GitHub Actions และการมี OMM ปัจจุบันต้องตรวจหลังติดตั้ง

# เพิ่มเติม v3.7 — ติดตั้ง GitHub Pages

อัปโหลดไฟล์จาก **USEFUL_Acquisition_Planner_v3.7_UPDATE_ONLY.zip** ไปไว้ที่ **root ของ Repository** โดยรักษาโครงสร้างโฟลเดอร์ `assets/` และแทนที่ไฟล์เว็บเดิม **อย่าลบหรือทับ** `sites.json`, `satellites.json`, `data/`, `xlsx/` ที่ใช้งานอยู่

ตรวจว่ามี `assets/theos1-map-marker.webp` และ `assets/theos1-model-thumb.webp` แล้วกด Hard Refresh (`Ctrl+Shift+R`) หลัง Deploy บน GitHub Pages. เวอร์ชันที่ Footer ต้องเป็น v3.7

หากรายชื่อดาวเทียมยังไม่มี THEOS-1 ให้เพิ่มจาก Settings → Satellites ระบุ NORAD **33396** (อย่าแทนที่ไฟล์ `satellites.json` ของทีมโดยไม่สำรองข้อมูลก่อน) รูปดาวเทียมเริ่มต้นจะผูกตาม NORAD นี้โดยอัตโนมัติเมื่อมีพิกัดวงโคจรที่ใช้ได้

ใช้แถบ **ประเภทพื้นที่ Cal/Val** ติ๊ก Radiometric / Geometric / Spatial / MTF และประเภทอื่น ๆ เพื่อกรอง Map / Calendar / Results / Export ในครั้งเดียว

สำหรับมุมขณะเปิดกล้อง เลื่อนลง Summary → Ground Station / Vicarious Cal/Val → **Imaging Geometry**, เลือกไซต์ เลือก *Specified UTC* และกรอกเวลาจากบันทึกการถ่ายภาพ (หรือ *Estimated closest approach* สำหรับประเมิน) ระบุ Duration แล้วกด Export Exposure Geometry CSV. ระบบจำกัดเฉพาะเวลาภายใน ±72 h ของ TLE Epoch; **ไม่ใช่ Attitude หรือเวลาสั่งเปิดกล้องที่ยืนยันจากดาวเทียม**

---

# วิธีติดตั้ง USEFUL Acquisition Planner v3.6 บน GitHub Pages

## A. อัปเดตจาก v3.5 (แนะนำ)

1. เปิด Repository `THEOS-2CalVal/Test-Site` แล้วสำรองทั้ง Repository หรือดาวน์โหลด ZIP ของเวอร์ชันเดิม
2. หากเคยเพิ่ม/แก้ไขพิกัดหรือดาวเทียมจากหน้าเว็บ ให้ Export ข้อมูล JSON จาก Settings ก่อน เพราะ browser localStorage ไม่ใช่ฐานข้อมูลส่วนกลาง
3. ดาวน์โหลด `USEFUL_Acquisition_Planner_v3.6_UPDATE_ONLY.zip` แตกไฟล์ แล้วอัปโหลด **เนื้อหาภายใน** ไปยัง Root ของ Repository (ไม่สร้างโฟลเดอร์ชั้นที่เกินมา)
4. ให้อัปโหลดทับเฉพาะ `index.html`, ไฟล์ JavaScript และ CSS ที่อยู่ใน `assets/`, พร้อม README / Release Notes ที่มากับ UPDATE
5. **อย่าลบหรือเขียนทับ** `sites.json`, `satellites.json`, `xlsx/`, `data/T2V_2026_sites.json`, `data/site_types.json` หรือไฟล์วงโคจรเดิม
6. ไปที่ Settings → Pages ตรวจว่าเป็น Branch `main` / `/(root)` แล้ว Commit/รอ GitHub Pages Deploy ตามปกติ
7. เปิด `https://theos-2calval.github.io/Test-Site/` และกด `Ctrl + Shift + R`; ตรวจ Footer ว่าเป็น `v3.6`

## B. การติดตั้งใหม่

แตก `USEFUL_Acquisition_Planner_v3.6_FULL.zip` และอัปโหลดไฟล์ทั้งหมดไปยัง Root ของ Repository รวมถึง `.github/workflows/update-orbit-assets.yml`, `.nojekyll`, `assets/`, `data/`, `scripts/`, `index.html`, `sites.json`, `satellites.json`. เปิด GitHub Pages จาก Branch `main` / root แล้วจึงทดลองระบบ

## C. เปิด Auto TLE/SGP4 สำหรับดาวเทียมหลายดวง

1. เข้า **Settings → Satellites** แล้วเพิ่มชื่อดาวเทียม + NORAD ID, สถานะ Active และข้อมูลอื่นตามต้องการ
2. หากดาวเทียมมี TLE ล่าสุด ให้ใช้ช่อง Paste TLE/OMM ในหน้าต่าง Edit; ระบบบันทึกในเบราว์เซอร์เครื่องนั้น
3. หากต้องการให้ทุกคนใช้ดาวเทียมดวงใหม่ ให้กด **Export satellites.json** และ Commit ไฟล์นี้ใน Root ของ GitHub
4. ไปที่ GitHub → **Actions → Refresh public satellite orbit assets → Run workflow**. Workflow จะดึงข้อมูลวงโคจรของดาวเทียมที่อยู่ใน `satellites.json` และเตรียมไลบรารี `satellite.js` 6.x ใน `assets/vendor/satellite.min.js`
5. ตรวจสถานะใน Fleet: **POSITION AVAILABLE** หรือ **ACTIVE · NO POSITION**. Active เพียงอย่างเดียว **ไม่สามารถรับรองว่าเป็นตำแหน่งดาวเทียมที่แสดงได้**
6. หากเว็บไม่พบ OMM/TLE หรือ TLE เก่ากว่า 72 ชั่วโมง จะไม่วาดจุดที่คาดเดาขึ้นเอง แม้ดาวเทียมจะถูกตั้ง Active

## D. การอัปโหลดรูปดาวเทียม

Settings → Satellites → Edit/Add → **Satellite map image**

- ประเภทไฟล์: **PNG หรือ WebP** เท่านั้น (โปร่งใสจะสวยบนแผนที่)
- ขนาดที่แนะนำ: **128×128 pixels** หรือภาพสัดส่วนใกล้เคียง โดยมีดาวเทียมอยู่กลางภาพ
- ขนาดไฟล์ก่อนอัปโหลด: **ไม่เกิน 1 MB**
- โปรแกรมย่อภาพเป็นสูงสุด 128×128 และแปลง WebP ฝั่งเบราว์เซอร์ก่อนบันทึก
- ต้อง Export `satellites.json` แล้ว Commit บน GitHub หากต้องการแชร์ภาพให้ผู้ใช้คนอื่น

## E. ค่าที่กรอกสำหรับแต่ละดาวเทียม

- **Revisit interval (days)**: ความถี่โดยประมาณของโอกาสกลับมาถ่ายพื้นที่ อาจต่างจากรอบซ้ำแนววงโคจร
- **Ground-track repeat cycle (days)**: รอบซ้ำของแนววงโคจรที่ตรวจสอบแล้ว หากตั้งค่านี้ ระบบใช้เป็นแหล่ง *heuristic proxy* สำหรับการคาดการณ์ระยะไกล โดยติดป้ายความเชื่อมั่นต่ำ (ค่าเริ่มต้น THEOS-2 = 26 วัน)
- **Downlink frequency (MHz)**: ใช้ประเมิน Doppler จาก Range Rate ใน Tracking CSV เฉพาะเมื่อมีข้อมูลที่กรอกจริง

## F. Export Ground-Station Tracking CSV

1. เลือกดาวเทียม พื้นที่ Active และช่วงเวลาในแถบวางแผนด้านบน แล้วกดคำนวณ
2. เลื่อนถึง **สรุปโอกาส / Acquisition Summary**, เปิด **Ground Station / Vicarious Cal/Val**
3. ตั้งช่วง Sampling 10, 30 หรือ 60 วินาที และ Minimum Elevation 0°, 5° หรือ 10°
4. กด **Export Tracking CSV** เพื่อนำออกตารางซึ่งมี AOS/LOS, UTC, Azimuth/Elevation, ระยะทางดาวเทียม, Range Rate, มุมดวงอาทิตย์, ดวงจันทร์โดยประมาณ, ความต่างมุม Sun–Satellite, และ Doppler ถ้ากรอก MHz
5. ระบบใช้ **SGP4 เท่านั้น** และจำกัดแถว Tracking ที่อยู่ภายใน ±72 ชั่วโมงจาก TLE Epoch ถ้าไม่มีข้อมูลในช่วงดังกล่าวจะแจ้งสาเหตุ ไม่สร้างข้อมูลจากรอบซ้ำ 26 วัน

## G. ข้อจำกัดความแม่นยำและความปลอดภัย

ผลลัพธ์คือการจำลองเรขาคณิตจากข้อมูลวงโคจร ไม่ใช่ telemetry, tasking หรือคำสั่งหันเสาอากาศที่ผ่านการตรวจสอบ การกำหนดระยะเวลาสัญญาณที่ใช้ได้จริงต้องมีมุมบังภูมิประเทศ การหักเหในบรรยากาศ การวัดทิศเสาอากาศ ความถี่จริง EIRP ความไวของสถานี และการตรวจสอบด้วย Ephemeris/OEM ของภารกิจ รวมถึงต้องตรวจสอบระบบนำทางและ Attitude ของดาวเทียมก่อนใช้สำหรับ Vicarious Calibration


## v3.8 — UI / สีและระยะห่าง
เพิ่มไฟล์ `assets/ui-balance-v38.css` เพื่อแยกสี Site Type และ ASC/DESC และจัดข้อมูลใน Daily Inspection / Result Table ให้เป็นระเบียบ อ่านเพิ่มเติมใน `RELEASE_NOTES_v3.8.md`


## v3.9: Quick Planner / Field Planning Sheet

- อัปโหลดโค้ดจากไฟล์ UPDATE โดยรักษา `sites.json`, `satellites.json`, `data/`, `xlsx/` เดิมไว้
- Quick Planner รับพิกัดในรูป `13.101936, 100.929423` หรือลิงก์ Google Maps แบบเต็ม ข้อมูลจะหายเมื่อ Refresh จนกว่าจะกด **บันทึกพื้นที่**
- **Field Planning Sheet CSV** อยู่ที่ Acquisition Summary; เลือกเขตเวลา (UTC/Nevada/Bangkok/Paris) ก่อน Export
- คอลัมน์ Roll Angle (actual) และ Confirmed จะไม่สร้างขึ้นเองจาก TLE. รายการ 26-day repeat จะไม่มี Az/El ของการติดตามที่ไม่สามารถพิสูจน์ได้
- ปุ่ม − / ＋ ที่หัวแผงใช้ย่อ/ขยาย หน้าต่างเปิดทั้งหมดเป็นค่าเริ่มต้นเมื่อยังไม่เคยปรับ

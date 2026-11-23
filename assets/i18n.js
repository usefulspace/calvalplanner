/* USEFUL Acquisition Planner 2.4 — bilingual UI, no network dependency. */
(() => {
  'use strict';
  const STORE = 'theos2:planner:v23:lang';
  let language = localStorage.getItem(STORE) === 'en' ? 'en' : 'th';
  // Technical names, user-entered site names, and external content are intentionally unchanged.
  const translations = new Map(Object.entries({
    'คำนวณเวลาผ่านใกล้ที่สุดและมุม Off-nadir จาก SGP4 สำหรับทุกพื้นที่ก่อน Export · ผลลัพธ์ไม่ใช่ยืนยัน Tasking':'Calculate estimated UTC closest approach and LOS off-nadir for every site before export · not confirmed tasking',
    '◉ คำนวณทุกพื้นที่':'◉ Calculate All Sites',
    'การส่งออก 30 วัน / 1 ปี จะคำนวณ SGP4 ของทุกพื้นที่โดยอัตโนมัติ เฉพาะช่วงที่ข้อมูล TLE ยังใช้ประเมินได้':'30-day / 1-year exports will automatically calculate SGP4 for all sites, but only within the valid TLE screening horizon',
    'เปิด Auto TLE เพื่อเริ่มคำนวณ':'Enable Auto TLE to calculate',
    'ภาพรวม / Overview':'Overview',
    'แผนที่ 2D / 3D':'2D / 3D Maps',
    'ปฏิทินและ DSNU':'Calendar & DSNU',
    'พื้นที่สอบเทียบ':'Cal/Val Test Sites',
    'นำเข้าและส่งออก':'Import & Export',
    '＋ เพิ่มพื้นที่ใหม่':'＋ Add a Site',
    '＋ เพิ่มพื้นที่':'＋ Add Site',
    'ข้อมูลตำแหน่งบันทึกในเบราว์เซอร์':'Site changes are stored in this browser',
    'วางแผนการถ่ายภาพพื้นที่ Cal/Val · วิเคราะห์จันทรคติสำหรับ DSNU · ติดตามแนวโน้มเมฆ':'Plan Cal/Val imaging · screen moonless DSNU nights · review cloud outlooks',
    '↻ อัปเดตเมฆ':'↻ Refresh Clouds',
    '⇧ นำเข้า Excel':'⇧ Import Excel',
    'พิกัดอ้างอิงที่จัดเก็บ':'Stored reference coordinates',
    'รายการจากไฟล์ / แผนที่เพิ่มเอง':'From files / proposed entries',
    'วันแสงจันทร์ ≤':'Moon illumination ≤',
    '% ในเดือนนี้':'% this month',
    'เลือกพื้นที่เพื่อดูพยากรณ์':'Select a site to view forecast',
    'คลิกแผนที่เพื่อระบุพิกัดใหม่ · เลือก Marker เพื่อดูรายละเอียด':'Click map to add a location · select a marker for details',
    'เลือกจุดบนแผนที่เพื่อจัดการพิกัด · ไม่ใช่การคำนวณเส้นทางวงโคจร':'Select a map point to edit coordinates · not an orbit propagation map',
    '✎ แก้ไขพิกัด':'✎ Edit Coordinates',
    '⌖ ดูบนแผนที่':'⌖ View on Map',
    'ข้อมูลพยากรณ์ยังไม่พร้อม':'Forecast currently unavailable',
    'ช่วงเวลาอ้างอิง':'Reference period',
    '10:00–15:00 น. ของพื้นที่':'10:00–15:00 local site time',
    'แหล่งข้อมูล':'Data source',
    'พยากรณ์ครอบคลุมเฉพาะช่วงที่มีข้อมูล':'Forecast shown only when available',
    '↻ ดึงพยากรณ์เมฆล่าสุด':'↻ Update Cloud Forecast',
    '/ ปฏิทินวางแผน':'/ Planning Calendar',
    'การส่องสว่างของดวงจันทร์คำนวณเชิงดาราศาสตร์ · โอกาสถ่ายภาพนำเข้าจาก Excel หรือเพิ่มเอง':'Astronomical moon illumination · acquisition entries imported from Excel or added manually',
    '＋ เพิ่มแผนถ่ายภาพ':'＋ Add Acquisition',
    'เดือนปัจจุบัน':'Current Month',
    'พื้นที่':'Site',
    'ทุกพื้นที่':'All Sites',
    'มุม':'Angle',
    'ทุกมุม':'All Angles',
    'รอบซ้ำ 26 วัน':'26-day repeat (estimate)',
    'จาก Excel':'From Excel',
    'แผนที่เพิ่มเอง':'Manually proposed',
    'ประมาณจากรอบซ้ำ':'Cycle estimate',
    'เดือนมืด / DSNU candidate':'Dark Moon / DSNU candidate',
    'เมฆพยากรณ์เฉพาะช่วงที่มีข้อมูล':'Cloud outlook only within forecast window',
    'เน้นวันที่ดวงจันทร์สว่าง ≤':'Highlight lunar illumination ≤',
    'ยังไม่ใช่หน้าต่าง DSNU ที่ยืนยันแล้ว':'Not a confirmed DSNU acquisition window',
    'ต้องตรวจความมืดจริง ตำแหน่งดวงจันทร์ และข้อกำหนดการถ่ายภาพอีกครั้ง':'Verify night darkness, Moon geometry and operational constraints',
    '⇩ ส่งออก CSV':'⇩ Month CSV',
    'รายละเอียดประจำวันที่เลือก':'Selected Day Details',
    'จันทรคติ (ประมาณ)':'Lunar phase (estimate)',
    'ความสว่างดวงจันทร์':'Moon illumination',
    'Cloud ณ พื้นที่เลือก':'Cloud at selected site',
    'คลิกวันที่ในปฏิทินเพื่อดูรายการ':'Select a calendar day for details',
    'ช่วงเดือนมืดช่วยคัดกรองวันเบื้องต้น แต่การถ่ายภาพ DSNU ยังต้องตรวจ Sun/Moon geometry และเงื่อนไขการดำเนินงานของดาวเทียม':'Moonless periods are screening candidates only. DSNU requires Sun/Moon geometry and actual satellite operational constraints.',
    'ค่า Cloud Cover เป็นผลแบบจำลองอากาศที่จุดพิกัด ไม่ใช่การวิเคราะห์เมฆจากภาพ THEOS-2 จริง และไม่มีข้อมูลเกินระยะพยากรณ์':'Cloud cover is a numerical forecast at a point, not the observed cloud mask of a THEOS-2 image. Outside the horizon no forecast is shown.',
    'Auto TLE ช่วยคัดกรองช่วงดาวเทียมผ่านพื้นที่ด้วย SGP4 แต่ยังไม่มี attitude, sensor swath และข้อจำกัดการถ่ายภาพจริง จึงไม่ใช่คำสั่ง Tasking':'Auto TLE screens approximate satellite proximity with SGP4, but lacks attitude, sensor swath and tasking constraints. It is not a confirmed task.',
    '/ จัดการพื้นที่':'/ Manage Sites',
    'บันทึกแก้ไขพิกัด WGS84 ได้ทันที · การเปลี่ยนแปลงจะเก็บในเบราว์เซอร์เครื่องนี้':'Add and edit WGS84 coordinates · changes are saved only in this browser',
    '＋ เพิ่ม Test Site':'＋ Add Test Site',
    'ตัวอย่างพิกัดตั้งต้นอ้างอิง USGS ECCOE · โปรดตรวจ ROI ก่อนใช้ปฏิบัติการ':'Starter coordinates are USGS ECCOE examples · verify ROI for operations',
    'คืนค่าไซต์จากไฟล์ shared sites.json':'Restore sites from shared sites.json',
    '/ จัดการข้อมูล':'/ Data Management',
    'รองรับ Excel เดิม: Local Time พร้อมระบุ UTC offset ของไฟล์ต้นทาง เพื่อแปลงเป็น UTC อย่างถูกต้อง':'Legacy Excel Local Time requires a source UTC offset before conversion',
    'วางไฟล์ Excel หรือ CSV ที่นี่':'Drop Excel or CSV files here',
    'หรือคลิกเพื่อเลือกไฟล์':'or click to choose files',
    '(หลายไฟล์ได้)':'(multiple files allowed)',
    'ข้อมูลจากโฟลเดอร์ xlsx/ ของ GitHub จะโหลดอัตโนมัติ':'Files in GitHub xlsx/ are loaded automatically',
    '↑ นำเข้า JSON พื้นที่ / แผน':'↑ Import Sites / Plan JSON',
    '↓ ส่งออกแผนงาน JSON':'↓ Export Plan JSON',
    '↓ ส่งออกตาราง Excel (.xlsx)':'↓ Export Excel (.xlsx)',
    '⎙ พิมพ์ / Save as PDF':'⎙ Print / Save as PDF',
    'ไม่มีเซิร์ฟเวอร์เก็บข้อมูลส่วนกลาง การกด Save จะไม่แก้ไขไฟล์ใน GitHub โดยอัตโนมัติ':'This static app has no shared server. Saving in the browser does not modify GitHub.',
    'ยังไม่พบไฟล์ Excel · ตรวจ xlsx/ หรือ Upload ไฟล์ใหม่':'No Excel files found · check xlsx/ or upload new files',
    'ลบแผนที่เพิ่มเองในเบราว์เซอร์':'Clear manually proposed entries',
    'ลบข้อมูล Excel ที่นำเข้าชั่วคราว':'Clear browser-imported Excel data',
    'เพิ่มพื้นที่ Cal/Val':'Add Cal/Val Site',
    'ชื่อพื้นที่':'Site Name',
    'ประเทศ / ภูมิภาค':'Country / Region',
    'ประเภทพื้นที่':'Site Type',
    'หมายเหตุ':'Notes',
    'พิกัด WGS84 (EPSG:4326) · การบันทึกเป็น localStorage · Export JSON เพื่อแชร์ให้ทีม':'WGS84 (EPSG:4326) · saved to local browser storage · export JSON to share',
    'ยกเลิก':'Cancel',
    '✓ บันทึกพื้นที่':'✓ Save Site',
    'เพิ่มรายการวางแผนถ่ายภาพ':'Add Proposed Acquisition',
    'วันที่ UTC / UTC date':'Date (UTC)',
    'เวลา UTC / UTC time':'Time (UTC)',
    'รายการนี้จะถูกระบุว่าเป็น “Proposed / Manual” ไม่ใช่แผนที่ได้รับการยืนยันจาก Mission Operations':'This entry is Proposed / Manual, not a mission-operations-confirmed acquisition.',
    '✓ เพิ่มแผนถ่ายภาพ':'✓ Add Proposal',
    'รายการสาธิต ไม่ใช่ข้อมูลที่ยืนยัน':'Demonstration entries · not confirmed',
    'พยากรณ์มีเฉพาะช่วง 16 วัน':'Forecast available within 16-day horizon only',
    'ไม่มีข้อมูลสำหรับวันปัจจุบัน':'No forecast for current UTC date',
    'กำลังติดต่อ Open-Meteo...':'Connecting to Open-Meteo...',
    'ยังไม่มีไฟล์ Excel · แสดงตัวอย่างเฉพาะเมื่อไม่มีไฟล์จริง':'No Excel files loaded · demo shown only until real data arrives',
    'แสดงข้อมูลตัวอย่างจากเว็บเดิม · Upload Excel หรือใช้ไฟล์ xlsx/ เพื่อแสดงข้อมูลของคุณ':'Showing original-site demo entries · upload Excel or use xlsx/ for real data',
    'ไม่พบข้อมูล':'No data',
    'ไม่มีข้อมูลพยากรณ์':'No forecast available',
    'ไม่มีข้อมูลเมฆ':'No cloud data',
    'ไม่มีรายการถ่ายภาพในวันที่เลือก':'No acquisitions on the selected day',
    'สามารถกด “เพิ่มแผนถ่ายภาพ” เพื่อสร้างรายการใหม่':'Select Add Acquisition to propose a new entry',
    'เวลาไม่ยืนยัน':'Unverified time',
    'เลือกพื้นที่ก่อน':'Select a site first',
    'มุมมองแผนที่':'Map View',
    'เดือนดับ':'New Moon',
    'ข้างขึ้นเสี้ยว':'Waxing Crescent',
    'ขึ้นครึ่งดวง':'First Quarter',
    'ข้างขึ้นเกือบเต็ม':'Waxing Gibbous',
    'วันเพ็ญ':'Full Moon',
    'ข้างแรมเกือบเต็ม':'Waning Gibbous',
    'แรมครึ่งดวง':'Last Quarter',
    'ข้างแรมเสี้ยว':'Waning Crescent',
    'มกราคม':'January','กุมภาพันธ์':'February','มีนาคม':'March','เมษายน':'April','พฤษภาคม':'May','มิถุนายน':'June','กรกฎาคม':'July','สิงหาคม':'August','กันยายน':'September','ตุลาคม':'October','พฤศจิกายน':'November','ธันวาคม':'December',
    'อาทิตย์':'Sunday','จันทร์':'Monday','อังคาร':'Tuesday','พุธ':'Wednesday','พฤหัสฯ':'Thursday','ศุกร์':'Friday','เสาร์':'Saturday',
    'ขึ้น':'Waxing','แรม':'Waning','ค่ำ (ประมาณ)':'(approx.)',
    'พิกัด':'Coordinates',
    '◷ UTC (Z)':'◷ UTC (Z)'
  }));
  // English source strings used by new orbit/UTC features are translated back to Thai
  // when Thai is selected. Technical abbreviations and source identifiers remain stable.
  const englishToThai = new Map([
    ['Predict approximate ground proximity and off-nadir geometry from recent orbital elements, never confirmed tasking.','คัดกรองช่วงผ่านใกล้พื้นที่และมุม Off-nadir จากข้อมูลวงโคจรล่าสุด ไม่ใช่แผนถ่ายภาพที่ยืนยันแล้ว'],
    ['DATA SOURCE','แหล่งข้อมูล'],
    ['SELECTED SITE','พื้นที่ที่เลือก'],
    ['SCREENING MAX OFF-NADIR (°)','เกณฑ์ Off-nadir สูงสุด (°)'],
    ['Analysis threshold; not a satellite tasking limit','เป็นเกณฑ์คัดกรอง ไม่ใช่ข้อจำกัดการสั่งถ่ายภาพจริง'],
    ['↻ Refresh TLE','↻ อัปเดต TLE'],
    ['Paste TLE','วาง TLE'],
    ['TLE input / Offline backup (2-line or 3-line format)','นำเข้า TLE สำรอง (รูปแบบ 2 หรือ 3 บรรทัด)'],
    ['THEOS-2 NORAD 58016 · Paste official TLE elements below','THEOS-2 NORAD 58016 · วางข้อมูล TLE ที่ตรวจสอบแหล่งที่มาแล้ว'],
    ['Use pasted TLE','ใช้ TLE ที่วาง'],
    ['Important:','ข้อควรระวัง:'],
    ['SGP4 candidate = geometric proximity estimate only. TLE does not provide attitude, imaging command, cloud-free image, sensor swath or verified footprint. The tool restricts projections to 72 hours from now and at most ±3 days from TLE epoch; 1-year exports never extrapolate a single TLE for a year.','ผล SGP4 เป็นเพียงการประเมินการผ่านใกล้เชิงเรขาคณิต ไม่ใช่ข้อมูล Attitude คำสั่งถ่ายภาพ เมฆ พื้นที่กวาดกล้อง หรือ Footprint ที่ยืนยัน ระบบคำนวณไม่เกิน 72 ชั่วโมงข้างหน้าและภายใน ±3 วันจาก TLE Epoch; รายงาน 1 ปีไม่ใช้ TLE เดียวคาดการณ์ทั้งปี'],
    ['Auto TLE is off. Turn it on to estimate near-term orbital candidates.','ปิด Auto TLE อยู่ เปิดสวิตช์เพื่อคัดกรองโอกาสผ่านพื้นที่ในระยะใกล้'],
    ['Auto TLE is off. Enable it to predict short-range geometric candidates.','ปิด Auto TLE อยู่ เปิดสวิตช์เพื่อคัดกรองช่วงผ่านใกล้พื้นที่'],
    ['Auto TLE: ON','Auto TLE: เปิด'],
    ['Auto TLE: OFF','Auto TLE: ปิด'],
    ['Show ground tracks (past dashed / future solid)','แสดงเส้นทางดาวเทียม (ย้อนหลังเส้นประ / ล่วงหน้าเส้นทึบ)'],
    ['No fresh orbit data','ไม่มีข้อมูลวงโคจรที่เป็นปัจจุบัน'],
    ['SAT POSITIONS','ตำแหน่งดาวเทียม'],
    ['ORBITAL ASSETS / SPACECRAFT REGISTRY','ทะเบียนดาวเทียม / ข้อมูลวงโคจร'],
    ['Satellite Fleet','ทะเบียนดาวเทียม'],
    ['/ Multi-satellite monitoring','/ ติดตามดาวเทียมหลายดวง'],
    ['Satellite positions & ground tracks are estimated from public GP/TLE + SGP4, not live telemetry or confirmed tasking.','ตำแหน่งและเส้นทางดาวเทียมประมาณจาก GP/TLE + SGP4 ไม่ใช่ข้อมูล Telemetry จริงหรือคำสั่งถ่ายภาพที่ยืนยัน'],
    ['Export satellites.json','ส่งออก satellites.json'],
    ['↻ Refresh orbits','↻ อัปเดตวงโคจร'],
    ['+ Add Satellite','+ เพิ่มดาวเทียม'],
    ['Selected spacecraft for pass planning','เลือกดาวเทียมสำหรับคาดการณ์รอบผ่าน'],
    ['Satellite symbols indicate','สัญลักษณ์ดาวเทียมแสดง'],
    ['sub-satellite ground position','ตำแหน่งฉายบนพื้นโลก'],
    ["at current UTC; 3D map markers are projected on Earth's surface. Tracks show about 45 minutes before and after now. When orbital data are missing or older than 72 h, positions are hidden rather than invented. Added satellites are stored locally until you export and commit satellites.json.",'ตามเวลาปัจจุบัน UTC โดย Marker 3D อยู่บนผิวโลก เส้นทางแสดงประมาณ 45 นาทีที่ผ่านมาและข้างหน้า หากไม่มีข้อมูลวงโคจรหรือเก่ากว่า 72 ชั่วโมง ระบบจะซ่อนตำแหน่ง การเพิ่มดาวเทียมเก็บในเบราว์เซอร์จนกว่าจะส่งออกและ Commit satellites.json'],
    ['Auto TLE · Multi-Satellite','Auto TLE · ดาวเทียมหลายดวง'],
    ['Satellite for Auto TLE / SGP4','เลือกดาวเทียมสำหรับ Auto TLE / SGP4'],
    ['16-day TLE/OMM screening. 26-day repeat proxy applies ONLY to THEOS-2. No long-range repeat model is assumed for added satellites.','คัดกรองด้วย TLE/OMM 16 วันแรก ส่วนรอบซ้ำ 26 วันใช้เฉพาะ THEOS-2 เท่านั้น ไม่สมมติว่าดาวเทียมใหม่มีรอบซ้ำเหมือนกัน'],
    ['Test Site Types & Marker Colors','ประเภทพื้นที่ทดสอบและสี Marker'],
    ['Create or remove types. Removing a type assigns its sites to Other.','เพิ่มหรือลบประเภทพื้นที่ หากลบ ระบบจะย้ายพื้นที่ประเภทนั้นไป Other'],
    ['Export site_types.json','ส่งออก site_types.json'],
    ['+ Add Type','+ เพิ่มประเภท'],
    ['SATELLITE REGISTRY','ทะเบียนดาวเทียม'],
    ['Add / Edit Satellite','เพิ่ม / แก้ไขดาวเทียม'],
    ['Satellite Name','ชื่อดาวเทียม'],
    ['NORAD Catalog ID','รหัส NORAD Catalog'],
    ['Marker / Track Color','สี Marker และเส้นทาง'],
    ['Active satellite','ดาวเทียมที่เปิดใช้งาน'],
    ['Display position when orbital elements are available','แสดงตำแหน่งเมื่อมีข้อมูลวงโคจรที่ใช้ได้'],
    ['Optional: paste TLE (2/3-line) or OMM JSON','ตัวเลือก: วาง TLE (2/3 บรรทัด) หรือ OMM JSON'],
    ['For 6+ digit NORAD numbers, use OMM JSON; this requires satellite.js 6+ from GitHub Actions. Estimated live position is not spacecraft telemetry.','สำหรับ NORAD 6 หลักขึ้นไปให้ใช้ OMM JSON ซึ่งต้องมี satellite.js 6+ จาก GitHub Actions ตำแหน่งที่แสดงเป็นผลคำนวณ ไม่ใช่ Telemetry'],
    ['Save Satellite','บันทึกดาวเทียม'],
    ['↓ 30 Days CSV','↓ ส่งออก 30 วัน CSV'],
    ['↓ 1 Year CSV','↓ ส่งออก 1 ปี CSV'],
    ['↻ Month CSV','↻ CSV รายเดือน'],
  ]);
  function thai(text) {
    const base=text.trim();
    if(englishToThai.has(base)) {
      const left=text.match(/^\s*/)?.[0]||'',right=text.match(/\s*$/)?.[0]||'';
      return left+englishToThai.get(base)+right;
    }
    return text
      .replace(/^(\d+) SGP4 screening candidate\(s\)$/,'พบผู้สมัครช่วงผ่าน $1 รายการ (SGP4)')
      .replace(/^Retrieving TLE for THEOS-2 \(NORAD 58016\). Cached for at least two hours\./,'กำลังดึงข้อมูล TLE ของ THEOS-2 (NORAD 58016) และใช้แคชอย่างน้อย 2 ชั่วโมง')
      .replace(/^SGP4 screening for /,'กำลังคัดกรอง SGP4 สำหรับ ')
      .replace(/Near-term only\.\.\./,'เฉพาะช่วงเวลาใกล้ปัจจุบัน...')
      .replace(/^SGP4 ready · /,'ประมวลผล SGP4 แล้ว · ')
      .replace(/^Auto TLE unavailable: /,'Auto TLE ไม่พร้อมใช้งาน: ')
      .replace(/^SGP4 could not run: /,'ไม่สามารถคำนวณ SGP4: ')
      .replace(/^TLE epoch is /,'TLE Epoch ห่างจากปัจจุบัน ')
      .replace(/Outside ±72h validity: no reliable SGP4 candidates produced\./,'เกินช่วง ±72 ชั่วโมงที่กำหนด จึงไม่สร้างผลคัดกรอง SGP4')
      .replace(/Refresh TLE or paste new elements\./,'โปรดอัปเดต TLE หรือวางข้อมูลชุดใหม่');
  }
  const placeholderEN = new Map([
    ['เช่น SKP_Sriracha','e.g. SKP_Sriracha'],
    ['ประเภทเป้าหมาย, ROI, ข้อจำกัด, ผู้ประสานงาน...','Target type, ROI, constraints, contact...'],
    ['เช่น 8.5','e.g. 8.5'],
    ['แผนงานเบื้องต้น / TOR / ข้อจำกัด','Preliminary plan / TOR / constraints']
  ]);
  const original = new WeakMap();
  function english(text) {
    if (translations.has(text.trim())) {
      const padL=text.match(/^\s*/)?.[0]||'';const padR=text.match(/\s*$/)?.[0]||'';
      return padL+translations.get(text.trim())+padR;
    }
    // Dynamic messages, including numbers and site/date values.
    let out=text;
    for (const [th,en] of [...translations].sort((a,b)=>b[0].length-a[0].length)) {
      if (th.length>=8 && out.includes(th))out=out.split(th).join(en);
    }
    out=out.replace(/รายละเอียดวันที่\s*/g,'Details for ')
      .replace(/ขึ้น\s*(\d+)\s*ค่ำ\s*\(ประมาณ\)/g,'Waxing day $1 (approx.)')
      .replace(/แรม\s*(\d+)\s*ค่ำ\s*\(ประมาณ\)/g,'Waning day $1 (approx.)')
      .replace(/ขึ้น\s*(\d+)\s*\(approx\.\)/g,'Waxing day $1 (approx.)')
      .replace(/แรม\s*(\d+)\s*\(approx\.\)/g,'Waning day $1 (approx.)')
      .replace(/(\d+)\s*รายการ/g,'$1 entries')
      .replace(/(\d+)\s*แห่ง/g,'$1 sites')
      .replace(/(\d+)\s*ไฟล์/g,'$1 files')
      .replace(/โหมดคลิกเพื่อเพิ่มพิกัด: เปิด/g,'Click-to-add mode: on')
      .replace(/โหมดคลิกเพื่อเพิ่มพิกัด: ปิด/g,'Click-to-add mode: off');
    return out;
  }
  function translate() {
    if (!document.body) return;
    document.documentElement.lang=language;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let n;
    while ((n=walker.nextNode())) {
      if (['SCRIPT','STYLE','TEXTAREA','CODE'].includes(n.parentElement?.tagName))continue;
      if (!original.has(n))original.set(n,n.nodeValue);
      const base=original.get(n),desired=language==='en'?english(base):thai(base);
      if (n.nodeValue!==desired)n.nodeValue=desired;
    }
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
      if(!el.dataset.placeholderOriginal)el.dataset.placeholderOriginal=el.getAttribute('placeholder');
      el.placeholder=language==='en'?(placeholderEN.get(el.dataset.placeholderOriginal)||el.dataset.placeholderOriginal):el.dataset.placeholderOriginal;
    });
    for(const l of ['TH','EN']){
      const btn=document.getElementById('lang'+l);if(!btn)continue;
      const selected=(l.toLowerCase()===language);
      btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));
    }
  }
  function setLanguage(next){
    language=next==='en'?'en':'th';localStorage.setItem(STORE,language);
    translate();window.dispatchEvent(new CustomEvent('planner-language-changed',{detail:{language}}));
  }
  document.addEventListener('click',ev=>{
    const id=ev.target.closest('#langTH,#langEN')?.id;
    if(id)setLanguage(id==='langTH'?'th':'en');
  });
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;translate()});}
  const observer=new MutationObserver(schedule);
  function boot(){translate();observer.observe(document.body,{subtree:true,childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.PlannerI18N={current:()=>language,setLanguage,translate,english};
})();

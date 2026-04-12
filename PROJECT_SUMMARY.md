# SAG Clinic WhatsApp Automation — סיכום מלא

> מסמך זה מיועד לכל מי שמצטרף לפרויקט — מפתח, סוכן AI, או מנהל. קרא לפני כל עבודה.

עדכון אחרון: אפריל 2026

---

## מה הפרויקט עושה

מערכת אוטומציה: כאשר לקוח קונה מוצר בחנות Wix של SAG Clinic, נשלחת הודעת WhatsApp אוטומטית עם סרטון/תמונת הדרכה למוצר + מלל קצר מותאם. בנוסף, נשלחת הודעת אישור לאדמין עם פרטי ההזמנה. מוצרי לימפטי מקבלים גם קרוסל מדריך (5 תמונות). אם ההזמנה היא לאיסוף עצמי, הלקוח מקבל הודעה נוספת לתיאום הגעה.

**זרימה:**
```
לקוח קונה ב-Wix
     ↓
Wix Automation שולח HTTP POST
     ↓
שרת Node.js ב-Railway מקבל את ה-webhook
     ↓
שולח הודעת מדריך מוצר ללקוח (Twilio WhatsApp) [v2 media / v7 text fallback]
     ↓ [אם sendPdf=true]
שולח קרוסל מדריך לימפטי (5 תמונות)
     ↓ [אם איסוף]
שולח הודעת תיאום איסוף ללקוח
     ↓
שולח הודעת אישור לאדמין
     ↓ [אם הודעה נכשלה — async callback]
שולח התראת כשל לאדמין עם פרטי ההזמנה
```

---

## מידע טכני — גישה ופרטי חשבון

| שירות | פרטים |
|-------|--------|
| **WhatsApp From** | `whatsapp:+15559237951` |
| **Admin Number** | `+972532269415` |
| **Server** | https://sag-clinic-whatsapp-production.up.railway.app |
| **GitHub** | https://github.com/naorp07-boop/sag-clinic-whatsapp |
| **Wix Automation URL** | `https://sag-clinic-whatsapp-production.up.railway.app/webhook/order` |
| **Health Check** | `https://sag-clinic-whatsapp-production.up.railway.app/health` |
| **Debug Endpoint** | `POST /webhook/debug` |
| **Cloudinary Cloud** | `dfwsuzo3o` |
| **Cloudinary API Key** | `496433495496192` (sag-clinic-whatsapp key) |

**משתני סביבה ב-Railway:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM` = `whatsapp:+15559237951`
- `SERVER_URL` = `https://sag-clinic-whatsapp-production.up.railway.app`
- `PORT` (מוגדר אוטומטית)

---

## מבנה קבצים

```
sag-clinic-whatsapp/
├── index.js           ← שרת Express ראשי, כל הלוגיקה
├── products.js        ← 35 מוצרים: name, cloudinaryUrl, sendPdf, shortMessage
├── TEMPLATES.md       ← סיכום טמפלטי WhatsApp (SID, סטטוס, משתנים)
├── PROJECT_SUMMARY.md ← המסמך הזה
├── test-batch.js      ← סקריפט בדיקה — שולח לכל המוצרים
├── test-lymphatic.js  ← סקריפט בדיקה ספציפי למברשת לימפטי
├── create-carousel.js ← יצירת טמפלט carousel ב-Twilio API
├── package.json
├── .env               ← credentials (לא ב-git)
└── .gitignore
```

---

## products.js — מבנה ועדכון

כל מוצר מכיל:
```js
{
  name: "שם המוצר",          // לצורך matching עם שם המוצר ב-Wix
  cloudinaryUrl: "https://...", // URL וידאו/תמונה מ-Cloudinary (ריק = fallback לטקסט)
  sendPdf: false,             // true = שלח גם קרוסל מדריך לימפטי אחרי ההודעה
  shortMessage: "*מלל קצר*", // {{3}} בטמפלט — מלל מותאם למוצר
}
```

**פורמט URL תקני ב-Cloudinary:**
- וידאו רגיל: `https://res.cloudinary.com/dfwsuzo3o/video/upload/vc_h264/v[VERSION]/[name].mp4`
- וידאו ארוך (cupping-glow-set): `video/upload/vc_h264,br_280k,w_480/v.../cupping-glow-set.mp4`
- וידאו בינוני (lymphatic): `video/upload/vc_h264,br_800k/v.../lymphatic-guide-video.mp4`
- תמונה: `https://res.cloudinary.com/dfwsuzo3o/image/upload/v[VERSION]/[name].jpg`

**חשוב:**
- WhatsApp דורש H264 — תמיד יש `vc_h264` בURL
- WhatsApp מגביל 16MB — וידאואים ארוכים דורשים `br_XXXk`
- לאחר הוספת transformation חדש — חובה להריץ Eager transformation ב-Cloudinary API (ראה סקריפט test-batch.js)

**מוצרים ללא cloudinaryUrl (4):**
מסיכת פילינג משייפת, zero shine mask, סרום ויטמין C, SPF 50 הגנה שקוף — ממתינים לסרטונים.

---

## טמפלטי WhatsApp — בשימוש פעיל

### 1. `sag_clinic_product_media_v2` ← ראשי
- **SID:** `HX5abbc995fc229fb5bab33a1f2fcc8051`
- **מתי:** כל מוצר שיש לו `cloudinaryUrl`
- **משתנים:** `{{1}}`=שם לקוח, `{{2}}`=שם מוצר, `{{3}}`=shortMessage, `{{4}}`=cloudinaryUrl
- **חשוב:** `{{3}}` חייב להיות לא ריק — אם ריק נשלחת שגיאה 21656

### 2. `sag_clinic_lymphatic_guide_pdf_v3` ← קרוסל
- **SID:** `HXbf1960ae5c3e540061d762d186cf96f7`
- **מתי:** מוצרים עם `sendPdf: true` (מברשת לימפטי, כוסות רוח, 3× BETTER TOGETHER)
- **משתנים:** אין (סטטי — 5 תמונות מדריך)

### 3. `sag_clinic_product_order_v7` ← fallback
- **SID:** `HXa969b1d6cc99f69ca994be8ef176e0e2`
- **מתי:** מוצרים ללא `cloudinaryUrl`
- **משתנים:** `{{1}}`=שם, `{{2}}`=מוצר, `{{3}}`=ריק

### 4. `sag_clinic_admin_order_v2` ← אדמין
- **SID:** `HX501e1d97a53b01e53c52988963cc1515`
- **מתי:** כל הזמנה (גם כשל)
- **משתנים:** `{{1}}`=שם, `{{2}}`=מוצר (או הודעת כשל), `{{3}}`=טלפון, `{{4}}`=שעה+סוג משלוח

### 5. `sag_clinic_pickup_ready_v2` ← איסוף
- **SID:** `HXbf5fc8087b19b8608e1f273c762793cf`
- **מתי:** הזמנות STORE_PICKUP בלבד
- **משתנים:** אין (סטטי)

---

## מנגנון בדיקת כשלים (Status Callback)

כל הודעה נשלחת עם `statusCallback: SERVER_URL/webhook/status`.
כאשר Twilio מקבל עדכון סטטוס מ-Meta:
- `delivered` / `read` → מחיקה מ-pendingMessages
- `failed` / `undelivered` → שליחת התראה לאדמין (`sag_clinic_admin_order_v2`) עם פרטי ההזמנה ומספר השגיאה

**מצב:** פעיל בייצור מ-12.04.2026

---

## index.js — לוגיקה מרכזית

### זיהוי פרטי לקוח מה-payload של Wix
| סוג | מיקום שם | מיקום טלפון |
|-----|-----------|-------------|
| משלוח רגיל | `data.logistics.contactDetails.firstName/lastName` | `data.logistics.contactDetails.phone` |
| איסוף עצמי | `data.contact.name.first/last` | `data.contact.phones[].e164Phone` |

### פורמט טלפון ישראלי
`formatIsraeliPhone` מטפל ב-`052-xxx`, `0521234567`, `+972...`, `50-883-6668`.

---

## Wix Automation — הגדרה

ב-Wix → Automations → sag-clinic-whatsapp:
- **Trigger:** Order placed
- **Action:** Send HTTP request
  - Method: `POST`
  - URL: `https://sag-clinic-whatsapp-production.up.railway.app/webhook/order`
  - Body: `Entire payload`

---

## Railway — Deploy

- כל push ל-GitHub → deploy אוטומטי
- לאמת: בדוק `version` ב-`/health`
- אם לא מעדכן: `git commit --allow-empty -m "trigger redeploy" && git push`

---

## שגיאות Twilio נפוצות

| קוד | משמעות | פתרון |
|-----|---------|--------|
| **21656** | contentVariables לא תקין (שדה ריק) | ודא שכל שדות המשתנים אינם ריקים |
| **63013** | Marketing throttle — יותר מדי הודעות לנמען/חשבון | המתן 24 שעות; בייצור לא יקרה |
| **63019** | מדיה לא הורדה | וידאו חייב H264 ≤16MB; הרץ Eager transformation |
| **63021** | מספר לא פעיל ב-WhatsApp | לא ניתן לתקן — לקוח לא רשום ב-WhatsApp |

---

## Cloudinary — Eager Transformation

**מה זה:** כדי ש-WhatsApp יוכל להוריד וידאו מ-Cloudinary, הגרסה המקודדת חייבת להיות מוכנה מראש ב-origin storage. בלי זה Cloudinary מקודד בזמן אמת — לוקח יותר מדי ולWhatsApp נגמר ה-timeout (63019).

**כיצד להריץ:**
```js
// POST https://api.cloudinary.com/v1_1/dfwsuzo3o/video/explicit
// Auth: Basic base64(API_KEY:API_SECRET)
// Body (form-urlencoded):
public_id=eyebrow-gel&type=upload&eager=vc_h264&eager_async=false
```

**לאחר הוספת וידאו חדש ל-products.js — חובה להריץ eager לפני הפעלה.**

---

## בדיקה מלאה לפני הפעלה

```bash
# 1. שרת פעיל
curl https://sag-clinic-whatsapp-production.up.railway.app/health

# 2. בדיקת מוצר ספציפי
node test-batch.js  # עדכן את TESTS עם המוצר הרצוי

# 3. בדיקת webhook מלאה
node -e "
const https = require('https');
const body = JSON.stringify({ data: {
  lineItems: [{ itemName: 'קצף ניקוי פנים' }],
  logistics: { contactDetails: { firstName: 'בדיקה', phone: '0532269415' } }
}});
const req = https.request({
  hostname: 'sag-clinic-whatsapp-production.up.railway.app',
  path: '/webhook/order', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>console.log(d)); });
req.write(body); req.end();
"
```

---

## בעיות שנפתרו

| בעיה | פתרון |
|------|--------|
| Wix "Failed due to technical issue" | URL חסר `/webhook/order` בסוף |
| לא מזהה טלפון בהזמנות איסוף | הוספת fallback ל-`contact.phones[].e164Phone` |
| הודעת אישור לא מגיעה לאדמין | טמפלט מאושר במקום freeform |
| Railway לא מ-deploy | push commit ריק |
| curl מגרבל עברית | שימוש ב-Node.js https.request בלבד |
| טמפלטים נדחים | הוספת טקסט סטטי, שינוי ל-UTILITY/MARKETING |
| 63019 — וידאו לא נטען | vc_h264 + Eager transformation + גבול 16MB |
| 63019 — וידאו גדול מ-16MB | br_280k,w_480 (cupping) / br_800k (lymphatic) |
| 21656 — contentVariables | shortMessage ריק — מולא לכל המוצרים |
| carousel נדחה | UTILITY לא תומך carousel — שינוי ל-MARKETING |

---

## מצב מוצרים — אפריל 2026

| סטטוס | כמות | מוצרים |
|--------|------|---------|
| ✅ אומת ועובד | 24 | קצף ניקוי, toner, לחות עשירה, חומצה הילארונית, סרום משקם, Bioactive, נוזל פצעים, לחות מאזנת, SPF×2, SPF מייקאפ, סרום משי, מברשת לימפטי, כוסות רוח, 5× BETTER TOGETHER, ג'ל עור בעייתי, קרם-ג'ל אקנה, קרם מרגיע |
| ⏳ ממתין לאישור (63013 throttle) | 6 | 5 ערכות + ערכת הבהרה — יפתרו מחר |
| ⏳ ממתין לבדיקה (vc_h264 eager) | 7 | ג'ל גבות, SPF50 לחות, הבהרה×2, סרום קמטים, cupping, lymphatic |
| ❌ ללא מדיה — fallback v7 | 4 | מסיכת פילינג, zero shine, ויטמין C, SPF שקוף |

---

## שדרוג עתידי

1. **הפעלת Wix Automation** — לאחר אישור כל המוצרים
2. **הוספת סרטונים ל-4 מוצרים חסרים** — להעלות ל-Cloudinary + Eager + עדכון products.js
3. **מעבר מ-Sandbox לייצור** — Twilio WhatsApp Business account
4. **מספר ישראלי** — הודעות מגיעות כרגע ממספר אמריקאי (+1 555)

# SAG Clinic WhatsApp Automation — סיכום מלא

> מסמך זה מיועד לכל מי שמצטרף לפרויקט — מפתח, סוכן AI, או מנהל. קרא לפני כל עבודה.

---

## מה הפרויקט עושה

מערכת אוטומציה: כאשר לקוח קונה מוצר בחנות Wix של SAG Clinic, נשלחת הודעת WhatsApp אוטומטית עם מדריך שימוש למוצר. בנוסף, נשלחת הודעת אישור לאדמין עם פרטי ההזמנה. אם ההזמנה היא לאיסוף עצמי, הלקוח מקבל הודעה נוספת לתיאום הגעה.

**זרימה:**
```
לקוח קונה ב-Wix
     ↓
Wix Automation שולח HTTP POST
     ↓
שרת Node.js ב-Railway מקבל את ה-webhook
     ↓
שולח הודעת מדריך מוצר ללקוח (Twilio WhatsApp)
     ↓ [אם איסוף]
שולח הודעת תיאום איסוף ללקוח
     ↓
שולח הודעת אישור לאדמין
```

---

## מידע טכני — גישה ופרטי חשבון

| שירות | פרטים |
|-------|--------|
| **WhatsApp From** | `whatsapp:+15559237951` (Twilio Sandbox) |
| **Admin Number** | `+972532269415` |
| **Server** | https://sag-clinic-whatsapp-production.up.railway.app |
| **GitHub** | https://github.com/naorp07-boop/sag-clinic-whatsapp |
| **Wix Automation URL** | `https://sag-clinic-whatsapp-production.up.railway.app/webhook/order` |
| **Health Check** | `https://sag-clinic-whatsapp-production.up.railway.app/health` |
| **Debug Endpoint** | `POST /webhook/debug` (מחזיר 200 ומדפיס כל מה שמגיע) |

**משתני סביבה ב-Railway:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM` = `whatsapp:+15559237951`
- `PORT` (מוגדר אוטומטית)

---

## מבנה קבצים

```
sag-clinic-whatsapp/
├── index.js          ← שרת Express ראשי, כל הלוגיקה
├── products.js       ← רשימת 35 מוצרים + הודעות + קישורי מדיה
├── sheet.csv         ← עותק מקומי של Google Sheet (מקור הנתונים)
├── TEMPLATES.md      ← סיכום טמפלטי WhatsApp
├── PROJECT_SUMMARY.md← המסמך הזה
├── package.json
├── .env              ← credentials (לא ב-git)
└── .gitignore
```

---

## products.js — מבנה ועדכון

כל מוצר מכיל:
```js
{
  name: "שם המוצר",      // לצורך matching עם שם המוצר ב-Wix
  message: "...",         // הודעה מותאמת (לא בשימוש כרגע עם הטמפלט הנוכחי)
  media: ["url1", ...]    // קישורי Google Drive (פתוחים לכולם, לא דורשים לוגין)
}
```

**עדכון products.js:** הורד CSV מהגיליון:
```
https://docs.google.com/spreadsheets/d/1wj84L4z82w5A5oYFcAqdPPUQDgfixENp24JcSNs9nUg/export?format=csv&gid=0
```
ואז הרץ את הסקריפט לבניית products.js מחדש.

**פונקציית חיפוש מוצר (`findProduct`):**
- מנרמל `|` — מחפש substring ו-case-insensitive
- אם לא נמצא מוצר — מחזיר `null` (מדלג ולא קורס)

---

## index.js — לוגיקה מרכזית

### זיהוי פרטי לקוח מה-payload של Wix
Wix שולח payload שונה לפי סוג המשלוח:

| סוג | מיקום שם | מיקום טלפון |
|-----|-----------|-------------|
| משלוח רגיל | `data.logistics.contactDetails.firstName/lastName` | `data.logistics.contactDetails.phone` |
| איסוף עצמי (STORE_PICKUP) | `data.contact.name.first/last` | `data.contact.phones[].e164Phone` |

הקוד בודק כל האפשרויות עם fallback:
```js
const firstName =
  data?.buyerInfo?.firstName ||
  data?.contactDetails?.firstName ||
  data?.logistics?.contactDetails?.firstName ||
  data?.contact?.name?.first || "";
```

### זיהוי איסוף עצמי
```js
const isPickup = data?.logistics?.shippingDestination?.pickupMethod === "STORE_PICKUP"
              || !data?.logistics?.contactDetails;
```

### פורמט טלפון ישראלי
`formatIsraeliPhone` מטפל ב:
- `052-xxx-xxxx` → `whatsapp:+972521234567`
- `0521234567` → `whatsapp:+972521234567`
- `+972508836668` → `whatsapp:+972508836668`
- `50-883-6668` (ללא 0) → מוסיף `972`

---

## טמפלטי WhatsApp — בשימוש פעיל

### 1. הודעת לקוח — מדריך מוצר
- **שם:** `sag_clinic_product_order_v7`
- **SID:** `HXa969b1d6cc99f69ca994be8ef176e0e2`
- **מתי:** כל הזמנה, לכל מוצר
- **משתנים:** `{{1}}`=שם, `{{2}}`=מוצר, `{{3}}`=קישור מדיה

### 2. הודעת איסוף ללקוח
- **שם:** `sag_clinic_pickup_ready_v2`
- **SID:** `HXbf5fc8087b19b8608e1f273c762793cf`
- **מתי:** הזמנות STORE_PICKUP בלבד
- **תוכן:** סטטי — "🎉 איזה כיף ההזמנה מוכנה... 📞 053-226-9415"

### 3. הודעת אישור אדמין
- **שם:** `sag_clinic_admin_order_v2`
- **SID:** `HX501e1d97a53b01e53c52988963cc1515`
- **מתי:** כל הזמנה, לאדמין בלבד
- **משתנים:** `{{1}}`=שם מלא, `{{2}}`=מוצר, `{{3}}`=טלפון, `{{4}}`=שעה + סוג משלוח

---

## Wix Automation — הגדרה

ב-Wix → Automations → sag-clinic-whatsapp:
- **Trigger:** Order placed
- **Action:** Send HTTP request
  - Method: `POST`
  - URL: `https://sag-clinic-whatsapp-production.up.railway.app/webhook/order`
  - Body params: `Entire payload`

**חשוב:** URL חייב לכלול את הנתיב המלא `/webhook/order`.

---

## Railway — Deploy

- כל push ל-GitHub מ-deploy אוטומטי
- לאמת deploy: בדוק `version` ב-`/health`
- אם Railway לא מעדכן — דחוף commit ריק:
  ```
  git commit --allow-empty -m "trigger redeploy" && git push
  ```
- לוגים: Railway Dashboard → Logs (הסר filter deployment ID כדי לראות כל ה-logs)

---

## WhatsApp Templates — תובנות מניסיון

### מה עובד
- טמפלטים עם **טקסט סטטי משמעותי** + משתנים מועטים — מאושרים
- קטגוריית **UTILITY** — קל יותר לאישור מ-MARKETING
- Hebrew מאושר כשפה

### מה נדחה
- טמפלטים שגוף ההודעה מורכב **ברובו ממשתנים** — נדחים תמיד
- ניסיון לשלוח הודעה מותאמת לפי מוצר (הטקסט השונה לכל מוצר כמשתנה) — נדחה מספר פעמים

### Twilio Sandbox — מגבלות
- הודעות template (contentSid) — עובדות תמיד, ללא הגבלה
- הודעות freeform (body:) — רק בתוך חלון 24 שעות מהודעה נכנסת / 72 שעות מ-Sandbox join
- לחידוש Sandbox: שלח `join influence-drawn` ל-`+1 415 523 8886`

### יצירת טמפלט חדש ב-API
```js
// 1. צור תוכן
POST https://content.twilio.com/v1/Content
Body: { friendly_name, language: "he", types: { "twilio/text": { body: "..." } } }

// 2. הגש לאישור
POST https://content.twilio.com/v1/Content/{SID}/ApprovalRequests/whatsapp
Body: { name, sender: "+15559237951", category: "UTILITY" }
```

**חשוב:** אין להשתמש curl לעברית — משתבש. השתמש ב-Node.js עם `https.request`.

---

## בעיות שנפתרו

| בעיה | פתרון |
|------|--------|
| Wix מראה "Failed due to a technical issue" | URL חסר `/webhook/order` בסוף |
| לא מזהה טלפון בהזמנות איסוף | הוספת fallback ל-`contact.phones[].e164Phone` |
| הודעת אישור לא מגיעה לאדמין | יצרנו טמפלט מאושר במקום freeform |
| Railway לא מ-deploy | push commit ריק, בדוק version ב-/health |
| GitHub חוסם push | Account SID בקובץ מדריך — הוסר |
| curl מגרבל עברית | שימוש ב-Node.js https.request בלבד |
| טמפלטים נדחים | הוספת טקסט סטטי, שינוי לקטגוריית UTILITY |
| הודעת מדיה נשלחת פעמיים | הוסרה שליחת URL נפרדת, נשאר רק כ-{{3}} |

---

## מה עדיין חסר / שדרוג עתידי

1. **הודעה מותאמת לפי מוצר** — כרגע כל הלקוחות מקבלים אותו טמפלט גנרי. בכל מוצר יש הודעה ייחודית ב-`products.js` אבל לא ניתן לשלוח אותה ישירות — WhatsApp דוחה טמפלטים עם גוף דינמי לחלוטין. פתרונות אפשריים:
   - טמפלט אחד לכל מוצר (35 טמפלטים) — עבודה אבל אפשרי
   - לחכות שMeta ישנה מדיניות

2. **מעבר מ-Sandbox לייצור** — כרגע השרת משתמש ב-Twilio Sandbox. לייצור מלא צריך Twilio WhatsApp Business account מאושר.

3. **הצגת מספר ישראלי ללקוחות** — כרגע ההודעות מגיעות ממספר אמריקאי (+1 555). לשנות צריך מספר WhatsApp ישראלי.

---

## בדיקת הכל עובד

```bash
# 1. בדיקת שרת
curl https://sag-clinic-whatsapp-production.up.railway.app/health

# 2. בדיקת webhook (Node.js)
node -e "
const https = require('https');
const body = JSON.stringify({
  data: {
    lineItems: [{ itemName: 'קצף ניקוי פנים' }],
    logistics: { contactDetails: { firstName: 'בדיקה', phone: '0532269415' } }
  }
});
const opts = {
  hostname: 'sag-clinic-whatsapp-production.up.railway.app',
  path: '/webhook/order', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};
const req = https.request(opts, res => {
  let d = ''; res.on('data', c => d += c); res.on('end', () => console.log(d));
});
req.write(body); req.end();
"

# 3. בדיקת איסוף עצמי
# שנה את lineItems ל-STORE_PICKUP בנתוני הבדיקה
```

---

## סיכום מצב נוכחי (אפריל 2026)

✅ מערכת פעילה לחלוטין בייצור
✅ כל 35 מוצרים מזוהים ומקושרים לקישורי מדיה
✅ הודעות לקוח — משלוח + איסוף
✅ הודעת אישור אדמין עם פרטים מלאים
✅ תמיכה במספרי טלפון בפורמטים שונים
⏳ שדרוג: הודעה מותאמת לפי מוצר (ממתין לפתרון WhatsApp template)

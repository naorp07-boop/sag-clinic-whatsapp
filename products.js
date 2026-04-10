// products.js — updated April 2026
// Fields: name (for matching), cloudinaryUrl (col G), sendPdf (col H), shortMessage (col I)
// ⚠️ Products without cloudinaryUrl fall back to v7 text-only template

const products = [
  {
    name: "קצף ניקוי פנים",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122403/facial-cleanser.mp4",
    sendPdf: false,
    shortMessage: "*כל שגרת טיפוח טובה, מתחילה בניקוי והכנה של העור*",
  },
  {
    name: "toner | לאיזון עור שמן",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122398/facial-toner.mp4",
    sendPdf: false,
    shortMessage: "*הטונר שלנו עושה הבדל אמיתי בעור שמן!*",
  },
  {
    name: "מסיכת פילינג משייפת",
    cloudinaryUrl: "",
    sendPdf: false,
    shortMessage: "*המסיכה שעושה הבדל אמיתי בעור כבר בשימוש הראשון!*",
  },
  {
    name: "zero shine mask | מסיכה טיפולית לעור שמן",
    cloudinaryUrl: "",
    sendPdf: false,
    shortMessage: "*מסיכה אחת שעושה את כל ההבדל בעור שמן עם פצעונים!*",
  },
  {
    name: "לחות עשירה לעור רגיל",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122400/moisturizer-normal.mp4",
    sendPdf: false,
    shortMessage: "*לחות מושלמת וקטיפתית, ללא תחושת שמנוניות או כבדות*",
  },
  {
    name: "סרום ויטמין C",
    cloudinaryUrl: "",
    sendPdf: false,
    shortMessage: "*מומלץ לשימוש בבוקר, לאחר ניקוי עם קצף פנים SAG*",
  },
  {
    name: "לחות מאזנת לעור שמן",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122397/moisturizer-oily.mp4",
    sendPdf: false,
    shortMessage: "*לחות מאזנת, שקופה וקלילה לעור שמן!*",
  },
  {
    name: "סרום משקם עם חומצה הילארונית",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122396/hyaluronic-serum.mp4",
    sendPdf: false,
    shortMessage: "*העור שלך הולך לזהור! הסרום הלחותי שלנו פועל עם פטנט מיוחד ללחות שנשמרת 24 שעות*",
  },
  {
    name: "סרום משקם ומחדש לעור",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122396/repair-serum.mp4",
    sendPdf: false,
    shortMessage: "*הסרום שהולך לעשות לך מהפך בעור! הקפידי על הוראות השימוש להרגלת העור בהדרגה. במידה ומופיעה צריבה/אדמומיות — התייעצו איתנו :)*",
  },
  {
    name: "סרום מתקן קמטים",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775123814/anti-wrinkle-serum.mp4",
    sendPdf: false,
    shortMessage: "*סרום חכם שעובד בעומק העור ונותן לו כל מה שהוא צריך, עם תוצאות שנראות לעין!*",
  },
  {
    name: "SPF 50 & לחות",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122393/spf50-moisturizer.mp4",
    sendPdf: false,
    shortMessage: "*התכשיר שמוכיח כי קרם הגנה לא חייב להיות כבד ושמנוני!*",
  },
  {
    name: "SPF 50 הגנה שקוף",
    cloudinaryUrl: "",
    sendPdf: false,
    shortMessage: "*קרם ההגנה המתקדם שלנו, עם פורמולה קלילה וחכמה! תתכונני להתמכר...*",
  },
  {
    name: "50 SPF & מייקאפ",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122395/spf50-makeup.mp4",
    sendPdf: false,
    shortMessage: "*הגנה עם פורמולה חכמה שמתאימה את עצמה לגוון עורך — אין ספק שבחרת נכון!*",
  },
  {
    name: "Bioactive skin FIX | נוזל להעלמת פצעים בגוף",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775123818/body-acne-treatment.mp4",
    sendPdf: false,
    shortMessage: "*נוזל הקסם שלנו! נא לשים לב להוראות השימוש, בייחוד לגבי כמות החומר. במידה ומופיעה צריבה/אדמומיות — התייעצו איתנו :)*",
  },
  {
    name: "נוזל לטיפול בפצעים בפנים",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122392/face-acne-treatment.mp4",
    sendPdf: false,
    shortMessage: "*נא להקפיד על הוראות השימוש, בדגש על כמות החומר. במידה ומופיעה צריבה/אדמומיות — התייעצו איתנו :)*",
  },
  {
    name: "קרם מרגיע ומשקם",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122390/soothing-cream.mp4",
    sendPdf: false,
    shortMessage: "*הקרם שמחזיר את הרוגע לעור שלך :)*",
  },
  {
    name: "ג'ל לטיפול בעור בעייתי ושמן",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122388/oily-skin-gel.mp4",
    sendPdf: false,
    shortMessage: "*נא להקפיד על הוראות השימוש, בדגש על כמות החומר על פני העור, למניעת גירוי/יובש.*",
  },
  {
    name: "קרם-ג'ל אקטיבי לטיפול בעור אקנתי",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122387/acne-gel.mp4",
    sendPdf: false,
    shortMessage: "*נא להקפיד על הוראות השימוש, בדגש על כמות החומר על פני העור, למניעת גירוי/יובש.*",
  },
  {
    name: "סרום הבהרה ליום",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122388/brightening-serum-day.mp4",
    sendPdf: false,
    shortMessage: "*נא להקפיד על הוראות השימוש, בדגש על כמות החומר על פני העור, למניעת גירוי/יובש.*",
  },
  {
    name: "סרום הבהרה יום-לילה",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122387/brightening-serum-night.mp4",
    sendPdf: false,
    shortMessage: "*נא להקפיד על הוראות השימוש, בדגש על כמות החומר על פני העור, למניעת גירוי/יובש.*",
  },
  {
    name: "סרום משי לגוף",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122387/body-serum.mp4",
    sendPdf: false,
    shortMessage: "*הסרום שמתאהבים בו כבר בשימוש הראשון...*",
  },
  {
    name: "מברשת עיסוי לימפטי",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775124887/cupping-glow-set.mp4",
    sendPdf: true,
    shortMessage: "*עיסוי עדין שיעשה לעור שלך פשוט טוב!*",
  },
  {
    name: "כוסות רוח לפנים",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775123830/lymphatic-guide-video.mp4",
    sendPdf: true,
    shortMessage: "*איזה כיף, תכף נתחיל להזרים חיים לפנים שלך!*",
  },
  {
    name: "ג'ל גבות",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122385/eyebrow-gel.mp4",
    sendPdf: false,
    shortMessage: "*הג'ל המושלם שלנו שלא משאיר שאריות לבנות על הגבות!*",
  },
  {
    name: "ערכת הבהרה",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775122381/kit-brightening.jpg",
    sendPdf: false,
    shortMessage: "*נא להקפיד להשתמש על פי הוראות השימוש. במידה ומופיעה צריבה/אדמומיות — התייעצו איתנו :)*",
  },
  {
    name: "ערכה לעור שמן",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775122380/kit-oily.jpg",
    sendPdf: false,
    shortMessage: "",
  },
  {
    name: "ערכת אנטיאייג' | עור עדין",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775122380/kit-antiaging.jpg",
    sendPdf: false,
    shortMessage: "",
  },
  {
    name: "ערכת אנטיאייג' | VIP",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775122379/kit-antiaging-vip.jpg",
    sendPdf: false,
    shortMessage: "",
  },
  {
    name: "ערכת בייסיק גלואו",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775122378/kit-basic-glow.jpg",
    sendPdf: false,
    shortMessage: "",
  },
  {
    name: "ניקוי עור שמן | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122403/facial-cleanser.mp4",
    sendPdf: false,
    shortMessage: "",
  },
  {
    name: "עור צעיר ורענן | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775124887/cupping-glow-set.mp4",
    sendPdf: true,
    shortMessage: "*נא להקפיד על שימוש נכון בסרום הלילה, למניעת גירוי או התקלפות העור*",
  },
  {
    name: "גוף חלק וזוהר | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775123818/body-acne-treatment.mp4",
    sendPdf: false,
    shortMessage: "*נא לשים לב להוראות השימוש! ☀️ בבוקר — הספגת הסרום. 🌙 בערב — שימוש בנוזל הקסם שלנו.*",
  },
  {
    name: "טיפול בעור עם פצעים | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775122392/face-acne-treatment.mp4",
    sendPdf: false,
    shortMessage: "*🌙 בערב: לאחר ניקוי — נוזל פנים באצבע, המתנה 2 דק, ואז קרם. הקפידי על קרם הגנה בחשיפה לשמש. במידה ומופיעה צריבה — התייעצו איתנו :)*",
  },
  {
    name: "עור פנים הדוק וזוהר | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775123830/lymphatic-guide-video.mp4",
    sendPdf: true,
    shortMessage: "*השילוב המושלם בין סרום חכם ועיסוי עמוק שיהפכו את העור שלך לחי וזוהר 💫*",
  },
  {
    name: "עור זוהר ומורם | BETTER TOGETHER",
    cloudinaryUrl: "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775124887/cupping-glow-set.mp4",
    sendPdf: true,
    shortMessage: "*השילוב המושלם בין עיסוי עדין לשחרור, והחלקה וואקום עמוק להזרמה והחייאת העור 💫*",
  },
];

function findProduct(name) {
  if (!name) return null;
  const normalized = name.replace(/\|/g, " ").toLowerCase().trim();
  return (
    products.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
    products.find((p) =>
      normalized.includes(p.name.replace(/\|/g, " ").toLowerCase().trim())
    ) ||
    products.find((p) =>
      p.name
        .replace(/\|/g, " ")
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .some((word) => word.length > 3 && normalized.includes(word))
    ) ||
    null
  );
}

module.exports = { findProduct };

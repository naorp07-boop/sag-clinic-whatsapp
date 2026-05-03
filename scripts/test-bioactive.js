require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_FROM;
const TO = "whatsapp:+972534848448";
const CUSTOMER_NAME = "נאור";
const PRODUCT_NAME = "Bioactive skin FIX | נוזל להעלמת פצעים בגוף";
const VIDEO_URL = "https://res.cloudinary.com/dfwsuzo3o/video/upload/vc_h264/v1775123818/body-acne-treatment.mp4";
const SHORT_MESSAGE = "*נוזל הקסם שלנו! נא לשים לב להוראות השימוש, בייחוד לגבי כמות החומר. במידה ומופיעה צריבה/אדמומיות — התייעצו איתנו :)*";

async function main() {
  console.log("📤 שולח הודעת טסט ל:", TO);
  console.log("📦 מוצר:", PRODUCT_NAME);
  console.log("🎬 URL סרטון:", VIDEO_URL);
  console.log("---");

  const msg = await client.messages.create({
    from: FROM,
    to: TO,
    contentSid: "HX5abbc995fc229fb5bab33a1f2fcc8051",
    contentVariables: JSON.stringify({
      "1": CUSTOMER_NAME,
      "2": PRODUCT_NAME,
      "3": SHORT_MESSAGE,
      "4": VIDEO_URL,
    }),
  });

  console.log("✅ נשלח בהצלחה!");
  console.log("📋 Message SID:", msg.sid);
  console.log("📊 Status:", msg.status);
  console.log("---");
  console.log("עכשיו בדוק ב-WhatsApp של 0534848448 אם הסרטון נפתח.");
}

main().catch((err) => {
  console.error("❌ שגיאה:", err.message);
  if (err.code) console.error("קוד שגיאה:", err.code);
});

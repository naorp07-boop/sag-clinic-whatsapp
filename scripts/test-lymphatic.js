require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_FROM;
const TO = "whatsapp:+972534848448";
const CUSTOMER_NAME = "בלעי";
const PRODUCT_NAME = "מברשת עיסוי לימפטי";
const VIDEO_URL = "https://res.cloudinary.com/dfwsuzo3o/video/upload/v1775124887/cupping-glow-set.mp4";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // 1. הודעת מוצר ללקוח (v7)
  console.log("📤 שולח הודעת מוצר ללקוח...");
  const msg1 = await client.messages.create({
    from: FROM,
    to: TO,
    contentSid: "HX5abbc995fc229fb5bab33a1f2fcc8051",
    contentVariables: JSON.stringify({
      "1": CUSTOMER_NAME,
      "2": PRODUCT_NAME,
      "3": "הנה המדריך המלא לשימוש נכון במברשת הלימפטית 💚",
      "4": VIDEO_URL,
    }),
  });
  console.log("✅ הודעת מוצר נשלחה. SID:", msg1.sid);

  await delay(2000);

  // 2. קרוסל מדריך לימפטי ללקוח
  console.log("📤 שולח קרוסל מדריך לימפטי...");
  const msg2 = await client.messages.create({
    from: FROM,
    to: TO,
    contentSid: "HXbf1960ae5c3e540061d762d186cf96f7",
  });
  console.log("✅ קרוסל נשלח. SID:", msg2.sid);

  await delay(2000);

  // 3. הודעת אישור אדמין
  console.log("📤 שולח הודעת אדמין...");
  const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  const msg3 = await client.messages.create({
    from: FROM,
    to: "whatsapp:+972532269415",
    contentSid: "HX501e1d97a53b01e53c52988963cc1515",
    contentVariables: JSON.stringify({
      "1": CUSTOMER_NAME,
      "2": PRODUCT_NAME,
      "3": "0534848448",
      "4": `${now} | 🚚 משלוח`,
    }),
  });
  console.log("✅ אדמין נשלח. SID:", msg3.sid);
}

main().catch(console.error);

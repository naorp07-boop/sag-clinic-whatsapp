require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const { findProduct } = require("./products");

const app = express();
app.use(express.json());

function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

function formatIsraeliPhone(phone) {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If starts with 972, keep as is
  if (digits.startsWith("972")) {
    return `whatsapp:+${digits}`;
  }

  // If starts with 0, replace with 972
  if (digits.startsWith("0")) {
    digits = "972" + digits.slice(1);
    return `whatsapp:+${digits}`;
  }

  // If already 9-10 digits without country code, assume Israel
  return `whatsapp:+972${digits}`;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.post("/webhook/order", async (req, res) => {
  console.log("📦 Received order webhook");

  try {
    const body = req.body;
    console.log("=== FULL BODY FROM WIX ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("=========================");

    // Extract buyer info
    const firstName = body?.buyerInfo?.firstName || "לקוח יקר";
    const rawPhone = body?.buyerInfo?.phone;

    // Try all possible product name fields Wix may send
    const lineItem = body?.lineItems?.[0];
    const productName =
      lineItem?.name ||
      lineItem?.productName ||
      lineItem?.title ||
      body?.orderedItems?.[0]?.name;

    console.log(`👤 Customer: ${firstName}`);
    console.log(`📞 Raw phone: ${rawPhone}`);
    console.log(`🛍️ Product: ${productName}`);

    if (!rawPhone) {
      console.warn("⚠️ No phone number in order");
      return res.status(400).json({ error: "Missing phone number" });
    }

    if (!productName) {
      console.warn("⚠️ No product name in order");
      return res.status(400).json({ error: "Missing product name" });
    }

    const toPhone = formatIsraeliPhone(rawPhone);
    console.log(`📱 Formatted phone: ${toPhone}`);

    const product = findProduct(productName);

    if (!product) {
      console.warn(`⚠️ Product not found: ${productName}`);
      return res.status(404).json({ error: `Product not found: ${productName}` });
    }

    console.log(`✅ Matched product: ${product.name}`);

    const messageText = product.message(firstName);

    // Send text message
    const client = getTwilioClient();
    console.log("📤 Sending WhatsApp text message...");
    const textMsg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toPhone,
      body: messageText,
    });
    console.log(`✅ Text message sent. SID: ${textMsg.sid}`);

    // Send PDF
    console.log("📎 Sending PDF...");
    const pdfMsg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toPhone,
      body: "📄 המדריך שלך מצורף כאן:",
      mediaUrl: [product.pdfUrl],
    });
    console.log(`✅ PDF sent. SID: ${pdfMsg.sid}`);

    res.json({ success: true, textSid: textMsg.sid, pdfSid: pdfMsg.sid });
  } catch (err) {
    console.error("❌ Error processing order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 שרת פעיל על פורט ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📬 Webhook URL: http://localhost:${PORT}/webhook/order`);
});

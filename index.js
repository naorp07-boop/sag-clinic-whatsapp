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
  res.json({
    status: "ok",
    message: "Server is running",
    version: "v7-approved",
    env: {
      SID_set: !!process.env.TWILIO_ACCOUNT_SID,
      SID_prefix: process.env.TWILIO_ACCOUNT_SID?.slice(0, 4) || "MISSING",
      TOKEN_set: !!process.env.TWILIO_AUTH_TOKEN,
      FROM_set: !!process.env.TWILIO_WHATSAPP_FROM,
      FROM: process.env.TWILIO_WHATSAPP_FROM || "MISSING",
    },
  });
});

// Debug endpoint — always returns 200, logs everything received
app.post("/webhook/debug", (req, res) => {
  console.log("🔍 DEBUG webhook hit!");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  res.json({ received: true, body: req.body });
});

app.post("/webhook/order", async (req, res) => {
  console.log("📦 Received order webhook");

  try {
    const body = req.body;
    console.log("=== FULL BODY FROM WIX ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("=========================");

    // Wix wraps payload in body.data — support both formats
    const data = body?.data || body;

    // Extract buyer info (support all Wix payload formats)
    const customerName =
      data?.buyerInfo?.firstName ||
      data?.contactDetails?.firstName ||
      data?.logistics?.contactDetails?.firstName ||
      "לקוח יקר";
    const rawPhone =
      data?.buyerInfo?.phone ||
      data?.contactDetails?.phone ||
      data?.logistics?.contactDetails?.phone;
    const lineItems = data?.lineItems || data?.orderedItems || [];

    console.log(`👤 Customer: ${customerName}`);
    console.log(`📞 Raw phone: ${rawPhone}`);
    console.log(`🛒 Items count: ${lineItems.length}`);

    if (!rawPhone) {
      console.warn("⚠️ No phone number in order");
      return res.status(400).json({ error: "Missing phone number" });
    }

    if (!lineItems.length) {
      console.warn("⚠️ No line items in order");
      return res.status(400).json({ error: "Missing line items" });
    }

    const toNumber = formatIsraeliPhone(rawPhone);
    console.log(`📱 Formatted phone: ${toNumber}`);

    const client = getTwilioClient();
    const sentProducts = [];
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    for (const item of lineItems) {
      const productName = item?.name || item?.itemName || item?.productName || item?.title;
      if (!productName) continue;

      const product = findProduct(productName);
      if (!product) {
        console.log(`⏭️ Skipping unknown product: ${productName}`);
        continue;
      }

      // Send message using approved template (sag_clinic_product_order_v3)
      console.log(`📤 Sending message for: ${product.name}`);
      const msg = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: toNumber,
        contentSid: "HXa969b1d6cc99f69ca994be8ef176e0e2",
        contentVariables: JSON.stringify({
          "1": customerName,
          "2": product.name,
          "3": product.media[0] || "",
        }),
      });
      console.log(`✅ Message sent. SID: ${msg.sid}`);
      sentProducts.push(product.name);

      // Delay between products (if more than one)
      if (lineItems.indexOf(item) < lineItems.length - 1) {
        await delay(2000);
      }
    }

    if (!sentProducts.length) {
      console.warn("⚠️ No matching products found in order");
      return res.status(404).json({ error: "No matching products found" });
    }

    // Send confirmation to admin (freeform — works within sandbox/session window)
    let adminSid = null;
    try {
      const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
      const adminMsg = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: "whatsapp:+972532269415",
        body: `✅ הודעה נשלחה!\n👤 לקוח: ${customerName}\n📦 מוצר: ${sentProducts.join(", ")}\n📱 טלפון: ${rawPhone}\n🕐 שעה: ${now}`,
      });
      adminSid = adminMsg.sid;
      console.log(`✅ Admin notification sent. SID: ${adminMsg.sid}`);
    } catch (adminErr) {
      console.error("⚠️ Admin notification failed:", adminErr.message);
    }

    res.json({ success: true, sentProducts, adminSid });
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

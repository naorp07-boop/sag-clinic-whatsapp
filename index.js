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

// Media redirect endpoint — redirects to Cloudinary URL by product key
const MEDIA_MAP = {
  "facial-cleanser":      "https://res.cloudinary.com/dfwsuzo3o/video/upload/facial-cleanser.mp4",
  "facial-toner":         "https://res.cloudinary.com/dfwsuzo3o/video/upload/facial-toner.mp4",
  "moisturizer-normal":   "https://res.cloudinary.com/dfwsuzo3o/video/upload/moisturizer-normal.mp4",
  "moisturizer-oily":     "https://res.cloudinary.com/dfwsuzo3o/video/upload/moisturizer-oily.mp4",
  "brightening-serum-day":"https://res.cloudinary.com/dfwsuzo3o/video/upload/brightening-serum-day.mp4",
  "brightening-serum-night":"https://res.cloudinary.com/dfwsuzo3o/video/upload/brightening-serum-night.mp4",
  "body-serum":           "https://res.cloudinary.com/dfwsuzo3o/video/upload/body-serum.mp4",
  "hyaluronic-serum":     "https://res.cloudinary.com/dfwsuzo3o/video/upload/hyaluronic-serum.mp4",
  "repair-serum":         "https://res.cloudinary.com/dfwsuzo3o/video/upload/repair-serum.mp4",
  "anti-wrinkle-serum":   "https://res.cloudinary.com/dfwsuzo3o/video/upload/anti-wrinkle-serum.mp4",
  "body-acne-treatment":  "https://res.cloudinary.com/dfwsuzo3o/video/upload/body-acne-treatment.mp4",
  "face-acne-treatment":  "https://res.cloudinary.com/dfwsuzo3o/video/upload/face-acne-treatment.mp4",
  "oily-skin-gel":        "https://res.cloudinary.com/dfwsuzo3o/video/upload/oily-skin-gel.mp4",
  "acne-gel":             "https://res.cloudinary.com/dfwsuzo3o/video/upload/acne-gel.mp4",
  "soothing-cream":       "https://res.cloudinary.com/dfwsuzo3o/video/upload/soothing-cream.mp4",
  "spf50-makeup":         "https://res.cloudinary.com/dfwsuzo3o/video/upload/spf50-makeup.mp4",
  "spf50-moisturizer":    "https://res.cloudinary.com/dfwsuzo3o/video/upload/spf50-moisturizer.mp4",
  "eyebrow-gel":          "https://res.cloudinary.com/dfwsuzo3o/video/upload/eyebrow-gel.mp4",
  "cupping-glow-set":     "https://res.cloudinary.com/dfwsuzo3o/video/upload/cupping-glow-set.mp4",
  "lymphatic-guide-video":"https://res.cloudinary.com/dfwsuzo3o/video/upload/lymphatic-guide-video.mp4",
  "kit-acne":             "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-acne.jpg",
  "kit-oily":             "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-oily.jpg",
  "kit-brightening":      "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-brightening.jpg",
  "kit-4":                "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-4.jpg",
  "kit-basic-glow":       "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-basic-glow.jpg",
  "kit-antiaging":        "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-antiaging.jpg",
  "kit-antiaging-vip":    "https://res.cloudinary.com/dfwsuzo3o/image/upload/kit-antiaging-vip.jpg",
  "lymphatic-guide-pdf":  "https://raw.githubusercontent.com/naorp07-boop/sag-clinic-whatsapp/master/guides/lymphatic-guide.pdf",
};

app.get("/media/:key", (req, res) => {
  const url = MEDIA_MAP[req.params.key];
  if (!url) return res.status(404).json({ error: "Not found" });
  res.redirect(301, url);
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

    // Extract buyer info (support all Wix payload formats incl. store pickup)
    const shipContact = data?.logistics?.shippingDestination?.contactDetails;
    const firstName =
      data?.buyerInfo?.firstName ||
      data?.contactDetails?.firstName ||
      data?.logistics?.contactDetails?.firstName ||
      shipContact?.firstName ||
      data?.contact?.name?.first ||
      "";
    const lastName =
      data?.buyerInfo?.lastName ||
      data?.contactDetails?.lastName ||
      data?.logistics?.contactDetails?.lastName ||
      shipContact?.lastName ||
      data?.contact?.name?.last ||
      "";
    const customerName = [firstName, lastName].filter(Boolean).join(" ") || "לקוח יקר";
    const contactPhone =
      data?.contact?.phones?.find((p) => p.primary)?.e164Phone ||
      data?.contact?.phones?.[0]?.e164Phone ||
      data?.contact?.phones?.find((p) => p.primary)?.phone ||
      data?.contact?.phones?.[0]?.phone;
    const rawPhone =
      data?.buyerInfo?.phone ||
      data?.contactDetails?.phone ||
      data?.logistics?.contactDetails?.phone ||
      shipContact?.phone ||
      contactPhone;
    const lineItems = data?.lineItems || data?.orderedItems || [];
    const isPickup = data?.logistics?.shippingDestination?.pickupMethod === "STORE_PICKUP";
    const deliveryType = isPickup ? "🏪 איסוף מהקליניקה" : "🚚 משלוח";

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

    // For pickup orders — send pickup coordination message to customer
    if (isPickup) {
      try {
        await delay(2000);
        const pickupMsg = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: toNumber,
          contentSid: "HXbf5fc8087b19b8608e1f273c762793cf",
        });
        console.log(`🏪 Pickup message sent. SID: ${pickupMsg.sid}`);
      } catch (pickupErr) {
        console.error("⚠️ Pickup message failed (template may be pending approval):", pickupErr.message);
      }
    }

    // Send confirmation to admin using approved template (no session window needed)
    let adminSid = null;
    try {
      const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
      const adminMsg = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: "whatsapp:+972532269415",
        contentSid: "HX501e1d97a53b01e53c52988963cc1515",
        contentVariables: JSON.stringify({
          "1": customerName,
          "2": sentProducts.join(", "),
          "3": rawPhone,
          "4": `${now} | ${deliveryType}`,
        }),
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

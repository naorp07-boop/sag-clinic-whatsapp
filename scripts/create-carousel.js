require("dotenv").config();
const https = require("https");

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDER = "+15559237951";

const templateBody = {
  friendly_name: "sag_clinic_lymphatic_carousel_v1",
  language: "he",
  variables: {},
  types: {
    "twilio/carousel": {
      body: "המדריך המלא למברשת הלימפטית + כוסות רוח לפנים 💚\nלחצי על החצים כדי לעבור בין הדפים:",
      cards: [
        {
          title: "עמוד 1",
          body: "מדריך SAG — מברשת לימפטית + כוסות רוח לפנים",
          media: ["https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775154785/lymphatic-guide-1_dj866s.jpg"],
          actions: []
        },
        {
          title: "עמוד 2",
          body: "",
          media: ["https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775154785/lymphatic-guide-2_xtj326.jpg"],
          actions: []
        },
        {
          title: "עמוד 3",
          body: "",
          media: ["https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775154785/lymphatic-guide-3_o4cmh1.jpg"],
          actions: []
        },
        {
          title: "עמוד 4",
          body: "",
          media: ["https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775154786/lymphatic-guide-4_tv3zwy.jpg"],
          actions: []
        },
        {
          title: "עמוד 5",
          body: "",
          media: ["https://res.cloudinary.com/dfwsuzo3o/image/upload/v1775154786/lymphatic-guide-5_azmabh.jpg"],
          actions: []
        }
      ]
    }
  }
};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
    const opts = {
      hostname: "content.twilio.com",
      path,
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("Creating carousel template...");
  const res = await request("POST", "/v1/Content", templateBody);
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(res.body, null, 2));

  if (res.status !== 201) {
    console.error("❌ Failed to create template");
    return;
  }

  const sid = res.body.sid;
  console.log(`\n✅ Template created! SID: ${sid}`);
  console.log("\nSubmitting for WhatsApp approval...");

  const approvalBody = {
    name: "sag_clinic_lymphatic_carousel_v1",
    sender: SENDER,
    category: "UTILITY",
  };

  const approvalRes = await request(
    "POST",
    `/v1/Content/${sid}/ApprovalRequests/whatsapp`,
    approvalBody
  );
  console.log("Approval status:", approvalRes.status);
  console.log("Approval response:", JSON.stringify(approvalRes.body, null, 2));

  if (approvalRes.status === 202) {
    console.log(`\n✅ Submitted for approval! SID: ${sid}`);
    console.log("Save this SID — you'll need it once approved.");
  }
}

main().catch(console.error);

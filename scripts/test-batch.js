require("dotenv").config();
const twilio = require("twilio");
const { findProduct } = require("./products");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_WHATSAPP_FROM;
const MEDIA_V2  = "HX5abbc995fc229fb5bab33a1f2fcc8051";
const CAROUSEL  = "HXbf1960ae5c3e540061d762d186cf96f7";
const V7_TEXT   = "HXa969b1d6cc99f69ca994be8ef176e0e2";

function formatPhone(p) {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("972")) return `whatsapp:+${d}`;
  if (d.startsWith("0"))   return `whatsapp:+972${d.slice(1)}`;
  return `whatsapp:+972${d}`;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ────────────────────────────────────────────────────
// 33 products distributed across 16 numbers
// (Bioactive + סרום משקם ומחדש already tested ✅)
// ────────────────────────────────────────────────────
const TESTS = [
  // --- בעלי (1 מוצר — כבר קיבל Bioactive היום) ---
  { phone: "0534848448",  name: "בעלי",   product: "קצף ניקוי פנים" },

  // --- יולנדה (1 מוצר — כבר קיבלה סרום משקם היום) ---
  { phone: "0532503458",  name: "יולנדה", product: "toner | לאיזון עור שמן" },

  // --- רעות ---
  { phone: "0548176378",  name: "רעות",   product: "לחות עשירה לעור רגיל" },
  { phone: "0548176378",  name: "רעות",   product: "ג'ל גבות" },

  // --- דורון ---
  { phone: "0535767747",  name: "דורון",  product: "מברשת עיסוי לימפטי" },   // sendPdf → carousel
  { phone: "0535767747",  name: "דורון",  product: "SPF 50 & לחות" },

  // --- אבי ---
  { phone: "0524355299",  name: "אבי",    product: "כוסות רוח לפנים" },       // sendPdf → carousel
  { phone: "0524355299",  name: "אבי",    product: "לחות מאזנת לעור שמן" },

  // --- אושי ---
  { phone: "0546830350",  name: "אושי",   product: "סרום הבהרה ליום" },
  { phone: "0546830350",  name: "אושי",   product: "סרום הבהרה יום-לילה" },

  // --- איב ---
  { phone: "0548108481",  name: "איב",    product: "ג'ל לטיפול בעור בעייתי ושמן" },
  { phone: "0548108481",  name: "איב",    product: "קרם-ג'ל אקטיבי לטיפול בעור אקנתי" },

  // --- איבט ---
  { phone: "0544529916",  name: "איבט",   product: "עור צעיר ורענן | BETTER TOGETHER" }, // sendPdf → carousel
  { phone: "0544529916",  name: "איבט",   product: "ערכת הבהרה" },

  // --- אינדי ---
  { phone: "0505747513",  name: "אינדי",  product: "נוזל לטיפול בפצעים בפנים" },
  { phone: "0505747513",  name: "אינדי",  product: "קרם מרגיע ומשקם" },

  // --- דורין ---
  { phone: "0535404347",  name: "דורין",  product: "50 SPF & מייקאפ" },
  { phone: "0535404347",  name: "דורין",  product: "סרום משי לגוף" },

  // --- ורד ---
  { phone: "0528448449",  name: "ורד",    product: "עור פנים הדוק וזוהר | BETTER TOGETHER" }, // sendPdf → carousel
  { phone: "0528448449",  name: "ורד",    product: "ערכה לעור שמן" },

  // --- לירן ---
  { phone: "0509404347",  name: "לירן",   product: "עור זוהר ומורם | BETTER TOGETHER" },      // sendPdf → carousel
  { phone: "0509404347",  name: "לירן",   product: "ערכת אנטיאייג' | עור עדין" },

  // --- ניסן ---
  { phone: "0508190147",  name: "ניסן",   product: "ניקוי עור שמן | BETTER TOGETHER" },
  { phone: "0508190147",  name: "ניסן",   product: "גוף חלק וזוהר | BETTER TOGETHER" },

  // --- רובי ---
  { phone: "0545733106",  name: "רובי",   product: "טיפול בעור עם פצעים | BETTER TOGETHER" },
  { phone: "0545733106",  name: "רובי",   product: "ערכת אנטיאייג' | VIP" },

  // --- רויטל (כולל 2 מוצרי טקסט-בלבד) ---
  { phone: "0508229900",  name: "רויטל",  product: "ערכת בייסיק גלואו" },
  { phone: "0508229900",  name: "רויטל",  product: "מסיכת פילינג משייפת" },
  { phone: "0508229900",  name: "רויטל",  product: "סרום ויטמין C" },

  // --- ספיר (כולל 2 מוצרי טקסט-בלבד) ---
  { phone: "0558834880",  name: "ספיר",   product: "zero shine mask | מסיכה טיפולית לעור שמן" },
  { phone: "0558834880",  name: "ספיר",   product: "SPF 50 הגנה שקוף" },
  { phone: "0558834880",  name: "ספיר",   product: "סרום משקם עם חומצה הילארונית" },
  { phone: "0558834880",  name: "ספיר",   product: "סרום מתקן קמטים" },
];

async function sendProduct(phone, name, productName) {
  const product = findProduct(productName);
  if (!product) {
    console.error(`❌ Product not found: "${productName}"`);
    return;
  }

  const to = formatPhone(phone);
  console.log(`📤 ${name} (${phone}) ← ${product.name}`);

  if (product.cloudinaryUrl) {
    const msg = await client.messages.create({
      from: FROM,
      to,
      contentSid: MEDIA_V2,
      contentVariables: JSON.stringify({
        "1": name,
        "2": product.name,
        "3": product.shortMessage || "",
        "4": product.cloudinaryUrl,
      }),
    });
    console.log(`   ✅ SID: ${msg.sid}`);
  } else {
    const msg = await client.messages.create({
      from: FROM,
      to,
      contentSid: V7_TEXT,
      contentVariables: JSON.stringify({
        "1": name,
        "2": product.name,
        "3": "",
      }),
    });
    console.log(`   ✅ SID: ${msg.sid} (text-only)`);
  }

  if (product.sendPdf) {
    await delay(2000);
    const guide = await client.messages.create({
      from: FROM,
      to,
      contentSid: CAROUSEL,
    });
    console.log(`   📖 Carousel SID: ${guide.sid}`);
  }
}

async function main() {
  const uniqueNumbers = new Set(TESTS.map((t) => t.phone)).size;
  console.log(`🚀 Batch test — ${TESTS.length} products across ${uniqueNumbers} numbers\n`);

  for (let i = 0; i < TESTS.length; i++) {
    const { phone, name, product } = TESTS[i];
    try {
      await sendProduct(phone, name, product);
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    if (i < TESTS.length - 1) await delay(3000);
  }

  console.log("\n✅ Done! Check Twilio console for delivery status.");
}

main().catch(console.error);

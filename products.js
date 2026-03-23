const products = [
  {
    name: "מברשת עיסוי לימפטי",
    pdfUrl: "https://drive.google.com/uc?export=download&id=1njxU8thOeu4m4_-8EPT_dUESK3ds6h6o",
    message: (firstName) =>
      `היי ${firstName}! 🌿 תודה שרכשת את מברשת העיסוי הלימפטי מ-SAG Clinic 💚 בקובץ המצורף תמצאי הסבר מפורט על אופן השימוש הנכון במברשת. לשאלות נוספות — אנחנו כאן בשבילך! 🙏`,
  },
  {
    name: "עור זוהר ומורם BETTER TOGETHER",
    pdfUrl: "https://drive.google.com/uc?export=download&id=141aZK_-I_MVHaZRbWtXfg_QeUT8dx5_v",
    message: (firstName) =>
      `היי ${firstName}! ✨ תודה שרכשת את חבילת עור זוהר ומורם מ-SAG Clinic 💚 בקובץ המצורף תמצאי הסבר מפורט על אופן השימוש הנכון בכל מוצרי החבילה. לשאלות נוספות — אנחנו כאן בשבילך! 🙏`,
  },
];

function findProduct(productName) {
  const normalized = productName.replace(/\s*\|\s*/g, " ").trim();
  return products.find((p) => {
    const pNorm = p.name.replace(/\s*\|\s*/g, " ").trim();
    return normalized.includes(pNorm) || pNorm.includes(normalized);
  });
}

module.exports = { products, findProduct };

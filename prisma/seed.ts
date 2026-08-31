import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  { id: "srv-xerox-bw-ss", name: "Xerox B&W (Single Side)", name_ta: "ஜெராக்ஸ் கருப்பு-வெள்ளை (ஒரு பக்கம்)", category: "XEROX", default_unit_price: 2.0, unit_label: "page" },
  { id: "srv-xerox-bw-ds", name: "Xerox B&W (Double Side)", name_ta: "ஜெராக்ஸ் கருப்பு-வெள்ளை (இரு பக்கம்)", category: "XEROX", default_unit_price: 3.0, unit_label: "sheet" },
  { id: "srv-xerox-col-ss", name: "Color Xerox (Single Side)", name_ta: "வண்ண ஜெராக்ஸ் (ஒரு பக்கம்)", category: "XEROX", default_unit_price: 10.0, unit_label: "page" },
  { id: "srv-xerox-col-ds", name: "Color Xerox (Double Side)", name_ta: "வண்ண ஜெராக்ஸ் (இரு பக்கம்)", category: "XEROX", default_unit_price: 18.0, unit_label: "sheet" },
  { id: "srv-print-bw", name: "B&W Document Printout (A4)", name_ta: "கருப்பு-வெள்ளை பிரிண்ட் (A4)", category: "PRINT", default_unit_price: 5.0, unit_label: "page" },
  { id: "srv-print-col", name: "Color Document Printout (A4)", name_ta: "வண்ண பிரிண்ட் (A4)", category: "PRINT", default_unit_price: 15.0, unit_label: "page" },
  { id: "srv-print-photo-pass", name: "Passport Size Photo (8 Copies)", name_ta: "பாஸ்போர்ட் புகைப்படம் (8 பிரதிகள்)", category: "PRINT", default_unit_price: 50.0, unit_label: "set" },
  { id: "srv-print-photo-gloss", name: "Glossy Photo Print (4x6 / A4)", name_ta: "புகைப்பட பிரிண்ட் (Glossy)", category: "PRINT", default_unit_price: 40.0, unit_label: "photo" },
  { id: "srv-lam-id", name: "ID Card / Aadhaar Lamination", name_ta: "அடையாள அட்டை லேமினேஷன்", category: "LAMINATION", default_unit_price: 20.0, unit_label: "card" },
  { id: "srv-lam-a4", name: "A4 Certificate Lamination", name_ta: "A4 சான்றிதழ் லேமினேஷன்", category: "LAMINATION", default_unit_price: 40.0, unit_label: "sheet" },
  { id: "srv-bind-spiral", name: "Spiral Binding (Document / Project)", name_ta: "ஸ்பைரல் பைண்டிங்", category: "LAMINATION", default_unit_price: 50.0, unit_label: "book" },
  { id: "srv-scan-mail", name: "Scanning & PDF / Email Send", name_ta: "ஸ்கேனிங் & இமெயில்", category: "LAMINATION", default_unit_price: 15.0, unit_label: "doc" },
  { id: "srv-esev-cert", name: "Community / Income / Nativity Certificate", name_ta: "சாதி / வருமானம் / இருப்பிட சான்றிதழ்", category: "E_SERVICE", default_unit_price: 120.0, unit_label: "appl" },
  { id: "srv-esev-patta", name: "Patta / Chitta / FMB Download & Print", name_ta: "பட்டா / சிட்டா நகல்", category: "E_SERVICE", default_unit_price: 80.0, unit_label: "copy" },
  { id: "srv-esev-pan", name: "New PAN Card / Correction Application", name_ta: "புதிய பான் கார்டு விண்ணப்பம்", category: "E_SERVICE", default_unit_price: 150.0, unit_label: "appl" },
  { id: "srv-esev-aadhaar", name: "Aadhaar Download / PVC Card Order", name_ta: "ஆதார் பதிவிறக்கம் / PVC அட்டை", category: "E_SERVICE", default_unit_price: 50.0, unit_label: "card" },
  { id: "srv-esev-eb", name: "TNEB Electricity Bill Payment (Service Charge)", name_ta: "மின் கட்டணம் செலுத்துதல்", category: "E_SERVICE", default_unit_price: 20.0, unit_label: "bill" },
  { id: "srv-esev-voter", name: "Voter ID Application / Address Change", name_ta: "வாக்காளர் அடையாள அட்டை மாற்றம்", category: "E_SERVICE", default_unit_price: 80.0, unit_label: "appl" },
  { id: "srv-esev-money", name: "Money Transfer / AEPS Cash Withdrawal (Commission)", name_ta: "பணம் அனுப்புதல் / எடுக்கும் கட்டணம்", category: "E_SERVICE", default_unit_price: 30.0, unit_label: "tx" },
  { id: "srv-stat-pen", name: "Ball Pen / Gel Pen (Blue / Black)", name_ta: "பேனா (நீலம் / கருப்பு)", category: "STATIONERY", default_unit_price: 10.0, unit_label: "piece" },
  { id: "srv-stat-file", name: "Office Stick File / Folder", name_ta: "ஸ்டிக் ஃபைல் / கோப்பு", category: "STATIONERY", default_unit_price: 15.0, unit_label: "piece" },
  { id: "srv-stat-env", name: "Cloth Envelope (A4 / Legal)", name_ta: "துணி உறை (A4 கவர்)", category: "STATIONERY", default_unit_price: 10.0, unit_label: "piece" },
];

async function main() {
  console.log("Seeding Neon PostgreSQL Database...");

  await prisma.shopSettings.upsert({
    where: { id: "default" },
    update: {
      address: "Next to SNS complex, Perumal temple street , Senjeriputhur",
    },
    create: {
      id: "default",
      shop_name: "Kathir Xerox & E-Service Centre",
      shop_name_ta: "கதிர் ஜெராக்ஸ் & இ-சேவை மையம்",
      phone: "9842100000",
      owner_whatsapp: "9842100000",
      upi_id: "kathirxerox@okaxis",
      address: "Next to SNS complex, Perumal temple street , Senjeriputhur",
      access_password: "RX135",
      enable_auto_digest: true,
    },
  });
  console.log("✔ Shop Settings seeded");

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        name_ta: s.name_ta,
        category: s.category,
        default_unit_price: s.default_unit_price,
        unit_label: s.unit_label,
        is_active: true,
      },
      create: {
        id: s.id,
        name: s.name,
        name_ta: s.name_ta,
        category: s.category,
        default_unit_price: s.default_unit_price,
        unit_label: s.unit_label,
        is_active: true,
      },
    });
  }
  console.log("✔ " + SERVICES.length + " Services seeded into catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

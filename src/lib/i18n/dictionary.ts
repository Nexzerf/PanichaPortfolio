import type { Lang } from "../types";

/** Static UI labels. Content lives in the database; owners can override any key in the `translations` table. */
export const dictionary = {
  "nav.work": { th: "ผลงาน", en: "Work" },
  "nav.about": { th: "เกี่ยวกับ", en: "About" },
  "nav.experience": { th: "ประสบการณ์", en: "Experience" },
  "nav.contact": { th: "ติดต่อ", en: "Contact" },
  "nav.menu": { th: "เมนู", en: "Menu" },
  "nav.close": { th: "ปิดเมนู", en: "Close menu" },
  "nav.skip": { th: "ข้ามไปยังเนื้อหา", en: "Skip to content" },
  "lang.switch": { th: "เปลี่ยนภาษา", en: "Change language" },

  "hero.viewWork": { th: "ดูผลงาน", en: "View Work" },
  "hero.contact": { th: "ติดต่อฉัน", en: "Contact Me" },
  "hero.scroll": { th: "เลื่อนลง", en: "Scroll" },
  "hero.greeting": { th: "สวัสดี ฉันชื่อ", en: "Hi, I’m" },

  "section.selectedWork": { th: "ผลงานคัดสรร", en: "Selected Work" },
  "section.selectedWork.kicker": { th: "Featured", en: "Featured" },
  "section.allWork": { th: "ผลงานทั้งหมด", en: "All Work" },
  "section.about": { th: "เกี่ยวกับฉัน", en: "About Me" },
  "section.skills": { th: "ทักษะ", en: "Skills" },
  "section.experience": { th: "ประสบการณ์", en: "Experience" },
  "section.education": { th: "การศึกษา", en: "Education" },
  "section.awards": { th: "รางวัลและความสำเร็จ", en: "Awards & Achievements" },
  "section.certificates": { th: "เกียรติบัตร", en: "Certificates" },
  "cert.view": { th: "ดู", en: "View" },
  "cert.pdf": { th: "เปิดไฟล์ PDF", en: "Open PDF" },
  "cert.verify": { th: "ตรวจสอบ", en: "Verify" },
  "section.contact": { th: "มาทำงานด้วยกัน", en: "Let’s work together." },
  "section.interests": { th: "ความสนใจ", en: "Interests" },

  "work.all": { th: "ทั้งหมด", en: "All" },
  "work.viewProject": { th: "ดูโปรเจกต์", en: "View project" },
  "work.viewAll": { th: "ดูผลงานทั้งหมด", en: "View all work" },
  "work.empty": { th: "ยังไม่มีผลงานในหมวดนี้", en: "No projects in this category yet." },
  "work.filter": { th: "กรองตามหมวดหมู่", en: "Filter by category" },
  "work.count": { th: "โปรเจกต์", en: "projects" },
  "work.watch": { th: "ดูคลิป", en: "Watch" },
  "work.details": { th: "ดูรายละเอียดผลงาน", en: "View project" },
  "work.close": { th: "ปิด", en: "Close" },
  "work.prev": { th: "ผลงานก่อนหน้า", en: "Previous" },
  "work.next": { th: "ผลงานถัดไป", en: "Next" },

  "project.year": { th: "ปี", en: "Year" },
  "project.role": { th: "บทบาท", en: "Role" },
  "project.team": { th: "ทีม", en: "Team" },
  "project.people": { th: "คน", en: "people" },
  "project.category": { th: "หมวดหมู่", en: "Category" },
  "project.overview": { th: "ภาพรวม", en: "Overview" },
  "project.problem": { th: "ปัญหา", en: "Problem" },
  "project.solution": { th: "แนวทางแก้ไข", en: "Solution" },
  "project.my_role": { th: "บทบาทของฉัน", en: "My Role" },
  "project.process": { th: "กระบวนการ", en: "Process" },
  "project.features": { th: "ฟีเจอร์", en: "Features" },
  "project.technology": { th: "เทคโนโลยี", en: "Technology" },
  "project.result": { th: "ผลลัพธ์", en: "Result" },
  "project.awards": { th: "รางวัล", en: "Awards" },
  "project.gallery": { th: "แกลเลอรี", en: "Gallery" },
  "project.video": { th: "วิดีโอ / เดโม", en: "Video / Demo" },
  "project.links": { th: "ลิงก์", en: "Links" },
  "project.github": { th: "GitHub", en: "GitHub" },
  "project.demo": { th: "เดโม", en: "Live demo" },
  "project.external": { th: "เว็บไซต์", en: "Website" },
  "project.related": { th: "ผลงานที่เกี่ยวข้อง", en: "Related Projects" },
  "project.back": { th: "กลับไปหน้าผลงาน", en: "Back to work" },
  "project.next": { th: "ผลงานถัดไป", en: "Next project" },

  "about.readMore": { th: "อ่านเพิ่มเติม", en: "More about me" },
  "about.resume": { th: "ดาวน์โหลด CV", en: "Download CV" },
  "about.location": { th: "ที่อยู่", en: "Based in" },

  "contact.name": { th: "ชื่อ", en: "Name" },
  "contact.email": { th: "อีเมล", en: "Email" },
  "contact.message": { th: "ข้อความ", en: "Message" },
  "contact.send": { th: "ส่งข้อความ", en: "Send" },
  "contact.sending": { th: "กำลังส่ง…", en: "Sending…" },
  "contact.sent": { th: "ส่งข้อความแล้ว ขอบคุณที่ติดต่อมา", en: "Message sent — thank you for reaching out." },
  "contact.error": { th: "ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", en: "Something went wrong. Please try again." },
  "contact.rateLimited": { th: "ส่งบ่อยเกินไป กรุณารอสักครู่", en: "Too many messages — please wait a few minutes." },
  "contact.invalid": { th: "กรุณากรอกข้อมูลให้ครบและถูกต้อง", en: "Please fill in every field correctly." },
  "contact.social": { th: "ช่องทางอื่น", en: "Elsewhere" },

  "footer.rights": { th: "สงวนลิขสิทธิ์", en: "All rights reserved." },
  "footer.top": { th: "กลับด้านบน", en: "Back to top" },

  "notFound.title": { th: "ไม่พบหน้านี้", en: "Page not found" },
  "notFound.back": { th: "กลับหน้าแรก", en: "Back home" },
} satisfies Record<string, Record<Lang, string>>;

export type DictKey = keyof typeof dictionary;
export type Translator = (key: DictKey) => string;

export const contactLabels = (t: Translator) => ({
  name: t("contact.name"),
  email: t("contact.email"),
  message: t("contact.message"),
  send: t("contact.send"),
  sending: t("contact.sending"),
  sent: t("contact.sent"),
  error: t("contact.error"),
  rateLimited: t("contact.rateLimited"),
  invalid: t("contact.invalid"),
  social: t("contact.social"),
});

export const workLabels = (t: Translator) => ({
  all: t("work.all"),
  empty: t("work.empty"),
  filter: t("work.filter"),
  view: t("work.viewProject"),
  watch: t("work.watch"),
  details: t("work.details"),
  close: t("work.close"),
  prev: t("work.prev"),
  next: t("work.next"),
});
export type WorkLabels = ReturnType<typeof workLabels>;

export const certificateLabels = (t: Translator) => ({
  view: t("cert.view"),
  pdf: t("cert.pdf"),
  verify: t("cert.verify"),
  close: t("work.close"),
  prev: t("work.prev"),
  next: t("work.next"),
});

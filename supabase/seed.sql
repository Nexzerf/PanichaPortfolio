-- Starter content for Panicha Portfolio. Everything here is editable (or deletable) from /admin.
-- Safe to run once on a fresh database after 0001_init.sql.

update portfolio.site_settings set
  site_name = 'Panicha Portfolio',
  seo_title_th = 'Panicha — Designer, Developer & Creative Technologist',
  seo_title_en = 'Panicha — Designer, Developer & Creative Technologist',
  seo_description_th = 'รวมผลงานด้านการออกแบบ พัฒนาเว็บไซต์ และเทคโนโลยีเชิงสร้างสรรค์ของ Panicha',
  seo_description_en = 'Selected work in design, web development and creative technology by Panicha.',
  contact_heading_th = 'มาทำงานด้วยกัน',
  contact_heading_en = 'Let’s work together.',
  contact_text_th = 'มีโปรเจกต์ ไอเดีย หรืออยากชวนร่วมทีม ส่งข้อความมาได้เลย',
  contact_text_en = 'Have a project, an idea or a team to build? Send a message.'
where id = 1;

update portfolio.profile set
  full_name_th = 'Panicha',
  full_name_en = 'Panicha',
  nickname_th = 'Panicha',
  nickname_en = 'Panicha',
  job_title_th = 'Designer, Developer & Creative Technologist',
  job_title_en = 'Designer, Developer & Creative Technologist',
  hero_subtitle_th = 'ออกแบบและพัฒนาผลิตภัณฑ์ดิจิทัลที่ใช้งานได้จริง เข้าถึงได้ และมีรายละเอียดที่ประณีต',
  hero_subtitle_en = 'I design and build digital products that are useful, accessible and carefully crafted.',
  short_bio_th = 'ฉันชอบทำงานตรงจุดที่การออกแบบและเทคโนโลยีมาบรรจบกัน — ตั้งแต่ไอเดียแรก จนถึงผลิตภัณฑ์ที่คนใช้ได้จริง',
  short_bio_en = 'I work where design meets technology — from the first sketch to a product people actually use.',
  location_th = 'กรุงเทพฯ ประเทศไทย',
  location_en = 'Bangkok, Thailand'
where id = 1;

insert into portfolio.categories (slug, name_th, name_en, sort_order) values
  ('development', 'พัฒนาซอฟต์แวร์', 'Development', 0),
  ('ui-ux', 'UI/UX', 'UI/UX', 1),
  ('ai', 'AI', 'AI', 2),
  ('accessibility', 'การเข้าถึง', 'Accessibility', 3),
  ('competition', 'การแข่งขัน', 'Competition', 4);

insert into portfolio.projects (slug, title_th, title_en, short_th, short_en, overview_th, overview_en, year, role_th, role_en, tools, status, featured, sort_order) values
  ('echosense', 'EchoSense', 'EchoSense',
   'แพลตฟอร์มสื่อสารด้วย AI สำหรับผู้บกพร่องทางการได้ยิน',
   'AI communication platform for Deaf and Hard-of-Hearing users.',
   'เว็บไซต์สำหรับช่วยให้ผู้มีความบกพร่องทางการได้ยินสามารถสื่อสารผ่านการโทรศัพท์ได้สะดวกขึ้น',
   'A communication platform designed to make phone conversations more accessible for people with hearing impairments.',
   2026, 'ผู้ออกแบบและนักพัฒนาหลัก', 'Lead Designer & Developer',
   array['Next.js', 'TypeScript', 'Speech-to-Text', 'Supabase'], 'published', true, 0),
  ('deckora', 'Deckora', 'Deckora',
   'แพลตฟอร์มเพิ่มประสิทธิภาพการเรียนสำหรับนักศึกษา',
   'Student productivity platform.',
   null, null, 2026, 'ผู้ออกแบบผลิตภัณฑ์และนักพัฒนา', 'Product Designer & Developer',
   array['React', 'Supabase', 'Figma'], 'published', true, 1),
  ('fastfix', 'FastFix', 'FastFix',
   'ระบบแจ้งซ่อมภายในมหาวิทยาลัย',
   'University repair reporting platform.',
   null, null, 2025, 'นักพัฒนา Full-stack', 'Full-stack Developer',
   array['Next.js', 'PostgreSQL'], 'published', true, 2);

insert into portfolio.project_categories (project_id, category_id)
select p.id, c.id from portfolio.projects p join portfolio.categories c on
  (p.slug = 'echosense' and c.slug in ('ai', 'development', 'accessibility', 'competition')) or
  (p.slug = 'deckora' and c.slug in ('development', 'ui-ux')) or
  (p.slug = 'fastfix' and c.slug in ('development'));

insert into portfolio.skills (name_th, name_en, group_th, group_en, sort_order) values
  ('UI/UX Design', 'UI/UX Design', 'ออกแบบ', 'Design', 0),
  ('Figma', 'Figma', 'ออกแบบ', 'Design', 1),
  ('Next.js / React', 'Next.js / React', 'พัฒนา', 'Development', 2),
  ('TypeScript', 'TypeScript', 'พัฒนา', 'Development', 3),
  ('Supabase / PostgreSQL', 'Supabase / PostgreSQL', 'พัฒนา', 'Development', 4);

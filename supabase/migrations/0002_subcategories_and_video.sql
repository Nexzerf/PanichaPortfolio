-- Subcategories (one level: a category may have a parent) and video items in project galleries.

alter table portfolio.categories
  add column parent_id uuid references portfolio.categories (id) on delete cascade,
  add constraint categories_not_own_parent check (parent_id is null or parent_id <> id);
create index categories_parent on portfolio.categories (parent_id);

-- Gallery items can be images or videos (uploaded MP4 or a YouTube / Vimeo / TikTok link).
alter table portfolio.project_images
  add column kind text not null default 'image' check (kind in ('image', 'video'));

-- Subcategories requested by the owner, under the existing "Video Editor" and "Graphic" categories
-- (created if missing).
insert into portfolio.categories (slug, name_th, name_en, sort_order) values
  ('video-editor', 'ตัดต่อวิดีโอ', 'Video Editor', 5),
  ('graphic', 'กราฟิกดีไซน์', 'Graphic', 6)
on conflict (slug) do nothing;

insert into portfolio.categories (slug, name_th, name_en, sort_order, parent_id)
select s.slug, s.th, s.en, s.ord, p.id
from (values
  ('video-editor', 'ai-clips', 'คลิป AI', 'AI Clips', 10),
  ('video-editor', 'game-editing', 'ตัดต่อเกม', 'Game Editing', 11),
  ('video-editor', 'short-form', 'คลิปสั้น', 'Short-form', 12),
  ('video-editor', 'long-form', 'คลิปยาว', 'Long-form', 13),
  ('video-editor', 'short-film', 'หนังสั้น', 'Short Film', 14),
  ('graphic', 'infographic', 'อินโฟกราฟิก', 'Infographic', 20),
  ('graphic', 'logo', 'โลโก้', 'Logo', 21),
  ('graphic', 'post', 'โพสต์', 'Post', 22),
  ('graphic', 'signage', 'งานป้าย', 'Signage', 23),
  ('graphic', 'card', 'การ์ด', 'Card', 24)
) as s(parent_slug, slug, th, en, ord)
join portfolio.categories p on p.slug = s.parent_slug
on conflict (slug) do nothing;

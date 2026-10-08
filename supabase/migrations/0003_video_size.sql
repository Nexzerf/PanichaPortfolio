-- Pixel size (or aspect) of a project's main video, so vertical clips (9:16) get a portrait player.
-- Filled automatically on save (Google Drive thumbnail size, YouTube Shorts / TikTok = 9:16);
-- the owner can flip it in the editor.
alter table portfolio.projects
  add column video_width int check (video_width > 0),
  add column video_height int check (video_height > 0);

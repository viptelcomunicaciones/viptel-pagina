import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_pages_floating_variant" AS ENUM('transparent', 'default', 'solid');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__pages_v_version_floating_variant" AS ENUM('transparent', 'default', 'solid');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_posts_comments" AS ENUM('inherit', 'enabled', 'disabled');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_posts_blog_image_overlay" AS ENUM('inherit', 'enabled', 'disabled');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__posts_v_version_comments" AS ENUM('inherit', 'enabled', 'disabled');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum__posts_v_version_blog_image_overlay" AS ENUM('inherit', 'enabled', 'disabled');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_position" AS ENUM('fixed', 'sticky', 'static');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_shape" AS ENUM('bar', 'floating');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_size" AS ENUM('sm', 'md', 'lg');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_variant" AS ENUM('default', 'solid', 'transparent');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_color_scheme" AS ENUM('default', 'invert');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_layout" AS ENUM('default', 'centered', 'minimal');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_max_width" AS ENUM('4xl', '5xl', '6xl', '7xl', 'full');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_scroll_progress_position" AS ENUM('top', 'bottom');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_link_groups_links_link_type" AS ENUM('reference', 'custom');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_layout" AS ENUM('columns', 'centered', 'simple', 'stacked', 'minimal');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_columns" AS ENUM('2', '3', '4');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_background" AS ENUM('default', 'secondary', 'invert');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_max_width" AS ENUM('4xl', '5xl', '6xl', '7xl', 'full');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_enabled_themes" AS ENUM('orange', 'amber', 'lime', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'magenta');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_default_theme" AS ENUM('orange', 'amber', 'lime', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'magenta');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_default_color_mode" AS ENUM('system', 'light', 'dark');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_toc_layout" AS ENUM('auto', 'inline', 'sidebar');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_toc_sidebar_position" AS ENUM('right', 'left');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_toc_max_depth" AS ENUM('2', '3', '4');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_comments_provider" AS ENUM('giscus', 'cusdis', 'artalk');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_comments_giscus_mapping" AS ENUM('pathname', 'url', 'title', 'og:title', 'specific', 'number');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_comments_giscus_input_position" AS ENUM('top', 'bottom');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_site_settings_comments_cusdis_theme" AS ENUM('auto', 'light', 'dark');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE TABLE IF NOT EXISTS "posts_populated_authors_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_posts_v_version_populated_authors_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "users_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users_locales" (
  	"role_title" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_link_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_link_groups_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "footer_link_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings_enabled_themes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_enabled_themes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar DEFAULT 'https://viptelcomunicaciones.com',
  	"email" varchar DEFAULT 'info@viptel.com',
  	"phone" varchar,
  	"address_street" varchar,
  	"address_city" varchar DEFAULT 'Bogotá',
  	"address_state" varchar,
  	"address_zip" varchar,
  	"address_country" varchar DEFAULT 'Colombia',
  	"og_image_id" integer,
  	"logo_image_id" integer,
  	"logo_custom_svg_path" varchar,
  	"logo_structured_data_image_id" integer,
  	"favicon_custom_svg_path" varchar DEFAULT '/favicon.svg',
  	"colors_theme_color" varchar DEFAULT '#0055aa',
  	"colors_background_color" varchar DEFAULT '#ffffff',
  	"default_theme" "enum_site_settings_default_theme" DEFAULT 'blue',
  	"default_color_mode" "enum_site_settings_default_color_mode" DEFAULT 'system',
  	"blog_image_overlay" boolean DEFAULT true,
  	"cursor_trail" boolean DEFAULT true,
  	"twitter_site" varchar DEFAULT '@viptel',
  	"toc_enabled" boolean DEFAULT true,
  	"toc_layout" "enum_site_settings_toc_layout" DEFAULT 'auto',
  	"toc_sidebar_position" "enum_site_settings_toc_sidebar_position" DEFAULT 'right',
  	"toc_min_headings" numeric DEFAULT 3,
  	"toc_max_depth" "enum_site_settings_toc_max_depth" DEFAULT '3',
  	"comments_enabled" boolean DEFAULT false,
  	"comments_provider" "enum_site_settings_comments_provider" DEFAULT 'giscus',
  	"comments_giscus_repo" varchar,
  	"comments_giscus_repo_id" varchar,
  	"comments_giscus_category" varchar,
  	"comments_giscus_category_id" varchar,
  	"comments_giscus_mapping" "enum_site_settings_comments_giscus_mapping" DEFAULT 'pathname',
  	"comments_giscus_strict" boolean DEFAULT false,
  	"comments_giscus_reactions_enabled" boolean DEFAULT true,
  	"comments_giscus_emit_metadata" boolean DEFAULT false,
  	"comments_giscus_input_position" "enum_site_settings_comments_giscus_input_position" DEFAULT 'bottom',
  	"comments_giscus_theme" varchar,
  	"comments_giscus_lang" varchar,
  	"comments_cusdis_app_id" varchar,
  	"comments_cusdis_host" varchar DEFAULT 'https://cusdis.com',
  	"comments_cusdis_theme" "enum_site_settings_comments_cusdis_theme" DEFAULT 'auto',
  	"comments_cusdis_lang" varchar,
  	"comments_artalk_server" varchar,
  	"comments_artalk_site" varchar,
  	"comments_artalk_js_url" varchar,
  	"comments_artalk_css_url" varchar,
  	"comments_artalk_dark_mode" varchar,
  	"comments_artalk_locale" varchar,
  	"blog_posts_per_page" numeric DEFAULT 12,
  	"blog_tag_cloud_limit" numeric DEFAULT 0,
  	"blog_rss_max_items" numeric DEFAULT 20,
  	"projects_per_page" numeric DEFAULT 12,
  	"projects_tag_cloud_limit" numeric DEFAULT 0,
  	"schemas_include_org_schema" boolean DEFAULT true,
  	"schemas_include_person_schema" boolean DEFAULT true,
  	"schemas_include_professional_service_schema" boolean DEFAULT false,
  	"verification_google" varchar,
  	"verification_bing" varchar,
  	"analytics_ga_measurement_id" varchar,
  	"analytics_gtm_id" varchar,
  	"analytics_umami_website_id" varchar,
  	"analytics_umami_src" varchar,
  	"consent_enabled" boolean DEFAULT false,
  	"consent_privacy_policy_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "site_settings_locales" (
  	"name" varchar DEFAULT 'Viptel Comunicaciones' NOT NULL,
  	"description" varchar,
  	"tagline" varchar,
  	"footer_note" varchar,
  	"logo_alt" varchar DEFAULT 'Viptel Comunicaciones',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "floating_variant" "enum_pages_floating_variant" DEFAULT 'transparent';
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "meta_canonical_url" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_floating_variant" "enum__pages_v_version_floating_variant" DEFAULT 'transparent';
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_meta_canonical_url" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "role_title" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "bio" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN IF NOT EXISTS "twitter_creator" varchar;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "meta_canonical_url" varchar;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "comments" "enum_posts_comments" DEFAULT 'inherit';
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "blog_image_overlay" "enum_posts_blog_image_overlay" DEFAULT 'inherit';
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "role_title" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "bio" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN IF NOT EXISTS "twitter_creator" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_meta_canonical_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_comments" "enum__posts_v_version_comments" DEFAULT 'inherit';
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_blog_image_overlay" "enum__posts_v_version_blog_image_overlay" DEFAULT 'inherit';
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "meta_canonical_url" varchar;
  ALTER TABLE "projects_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN IF NOT EXISTS "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_projects_v" ADD COLUMN IF NOT EXISTS "version_meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "_projects_v" ADD COLUMN IF NOT EXISTS "version_meta_canonical_url" varchar;
  ALTER TABLE "_projects_v_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_noindex" boolean DEFAULT false;
  ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "meta_canonical_url" varchar;
  ALTER TABLE "services_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version_meta_noindex" boolean DEFAULT false;
  ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version_meta_nofollow" boolean DEFAULT false;
  ALTER TABLE "_services_v" ADD COLUMN IF NOT EXISTS "version_meta_canonical_url" varchar;
  ALTER TABLE "_services_v_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_id" integer;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twitter_creator" varchar;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "position" "enum_header_position" DEFAULT 'sticky';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "shape" "enum_header_shape" DEFAULT 'bar';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "size" "enum_header_size" DEFAULT 'md';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "variant" "enum_header_variant" DEFAULT 'default';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "color_scheme" "enum_header_color_scheme" DEFAULT 'default';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "layout" "enum_header_layout" DEFAULT 'default';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "max_width" "enum_header_max_width" DEFAULT '6xl';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_search" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_theme_toggle" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_theme_selector" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_language_switcher" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_social_links" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_mobile_menu" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_active_state" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "hide_logo" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "show_scroll_progress" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "scroll_progress_position" "enum_header_scroll_progress_position" DEFAULT 'bottom';
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "auto_hide" boolean DEFAULT false;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "invert_on_return" boolean DEFAULT false;
  ALTER TABLE "header_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "layout" "enum_footer_layout" DEFAULT 'columns';
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "columns" "enum_footer_columns" DEFAULT '3';
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "background" "enum_footer_background" DEFAULT 'default';
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "max_width" "enum_footer_max_width" DEFAULT '6xl';
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "show_social" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "show_copyright" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "hide_logo" boolean DEFAULT false;
  ALTER TABLE "footer_locales" ADD COLUMN IF NOT EXISTS "tagline" varchar;
  ALTER TABLE "footer_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  DO $$ BEGIN
    ALTER TABLE "posts_populated_authors_social_links" ADD CONSTRAINT "posts_populated_authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_populated_authors"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "_posts_v_version_populated_authors_social_links" ADD CONSTRAINT "_posts_v_version_populated_authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_version_populated_authors"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "users_social_links" ADD CONSTRAINT "users_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "users_locales" ADD CONSTRAINT "users_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "footer_link_groups_links" ADD CONSTRAINT "footer_link_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_link_groups"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "footer_link_groups" ADD CONSTRAINT "footer_link_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings_enabled_themes" ADD CONSTRAINT "site_settings_enabled_themes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_image_id_media_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_structured_data_image_id_media_id_fk" FOREIGN KEY ("logo_structured_data_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "posts_populated_authors_social_links_order_idx" ON "posts_populated_authors_social_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_populated_authors_social_links_parent_id_idx" ON "posts_populated_authors_social_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_populated_authors_social_links_order_idx" ON "_posts_v_version_populated_authors_social_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_populated_authors_social_links_parent_id_idx" ON "_posts_v_version_populated_authors_social_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "users_social_links_order_idx" ON "users_social_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "users_social_links_parent_id_idx" ON "users_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_locales_locale_parent_id_unique" ON "users_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_links_order_idx" ON "footer_link_groups_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_links_parent_id_idx" ON "footer_link_groups_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_links_locale_idx" ON "footer_link_groups_links" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_order_idx" ON "footer_link_groups" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_parent_id_idx" ON "footer_link_groups" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_link_groups_locale_idx" ON "footer_link_groups" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "site_settings_enabled_themes_order_idx" ON "site_settings_enabled_themes" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "site_settings_enabled_themes_parent_idx" ON "site_settings_enabled_themes" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE INDEX IF NOT EXISTS "site_settings_logo_logo_image_idx" ON "site_settings" USING btree ("logo_image_id");
  CREATE INDEX IF NOT EXISTS "site_settings_logo_logo_structured_data_image_idx" ON "site_settings" USING btree ("logo_structured_data_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  DO $$ BEGIN
    ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "projects_rels_projects_id_idx" ON "projects_rels" USING btree ("projects_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_projects_id_idx" ON "_projects_v_rels" USING btree ("projects_id");
  CREATE INDEX IF NOT EXISTS "services_rels_projects_id_idx" ON "services_rels" USING btree ("projects_id","locale");
  CREATE INDEX IF NOT EXISTS "_services_v_rels_projects_id_idx" ON "_services_v_rels" USING btree ("projects_id","locale");
  CREATE INDEX IF NOT EXISTS "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX IF NOT EXISTS "header_rels_projects_id_idx" ON "header_rels" USING btree ("projects_id","locale");
  CREATE INDEX IF NOT EXISTS "footer_rels_projects_id_idx" ON "footer_rels" USING btree ("projects_id","locale");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "posts_populated_authors_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "_posts_v_version_populated_authors_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "users_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "users_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "footer_link_groups_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "footer_link_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "site_settings_enabled_themes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "site_settings_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "posts_populated_authors_social_links" CASCADE;
  DROP TABLE IF EXISTS "_posts_v_version_populated_authors_social_links" CASCADE;
  DROP TABLE IF EXISTS "users_social_links" CASCADE;
  DROP TABLE IF EXISTS "users_locales" CASCADE;
  DROP TABLE IF EXISTS "footer_link_groups_links" CASCADE;
  DROP TABLE IF EXISTS "footer_link_groups" CASCADE;
  DROP TABLE IF EXISTS "site_settings_enabled_themes" CASCADE;
  DROP TABLE IF EXISTS "site_settings_social_links" CASCADE;
  DROP TABLE IF EXISTS "site_settings" CASCADE;
  DROP TABLE IF EXISTS "site_settings_locales" CASCADE;
  ALTER TABLE "projects_rels" DROP CONSTRAINT IF EXISTS "projects_rels_projects_fk";
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT IF EXISTS "_projects_v_rels_projects_fk";
  ALTER TABLE "services_rels" DROP CONSTRAINT IF EXISTS "services_rels_projects_fk";
  ALTER TABLE "_services_v_rels" DROP CONSTRAINT IF EXISTS "_services_v_rels_projects_fk";
  ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_avatar_id_media_id_fk";
  ALTER TABLE "header_rels" DROP CONSTRAINT IF EXISTS "header_rels_projects_fk";
  ALTER TABLE "footer_rels" DROP CONSTRAINT IF EXISTS "footer_rels_projects_fk";
  DROP INDEX IF EXISTS "projects_rels_projects_id_idx";
  DROP INDEX IF EXISTS "_projects_v_rels_projects_id_idx";
  DROP INDEX IF EXISTS "services_rels_projects_id_idx";
  DROP INDEX IF EXISTS "_services_v_rels_projects_id_idx";
  DROP INDEX IF EXISTS "users_avatar_idx";
  DROP INDEX IF EXISTS "header_rels_projects_id_idx";
  DROP INDEX IF EXISTS "footer_rels_projects_id_idx";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "floating_variant";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_noindex";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_nofollow";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_canonical_url";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_floating_variant";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_noindex";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_nofollow";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_canonical_url";
  ALTER TABLE "posts_populated_authors" DROP COLUMN IF EXISTS "avatar_url";
  ALTER TABLE "posts_populated_authors" DROP COLUMN IF EXISTS "role_title";
  ALTER TABLE "posts_populated_authors" DROP COLUMN IF EXISTS "bio";
  ALTER TABLE "posts_populated_authors" DROP COLUMN IF EXISTS "twitter_creator";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_noindex";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_nofollow";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_canonical_url";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "comments";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "blog_image_overlay";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN IF EXISTS "avatar_url";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN IF EXISTS "role_title";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN IF EXISTS "bio";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN IF EXISTS "twitter_creator";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_meta_noindex";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_meta_nofollow";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_meta_canonical_url";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_comments";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_blog_image_overlay";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "meta_noindex";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "meta_nofollow";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "meta_canonical_url";
  ALTER TABLE "projects_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "_projects_v" DROP COLUMN IF EXISTS "version_meta_noindex";
  ALTER TABLE "_projects_v" DROP COLUMN IF EXISTS "version_meta_nofollow";
  ALTER TABLE "_projects_v" DROP COLUMN IF EXISTS "version_meta_canonical_url";
  ALTER TABLE "_projects_v_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_noindex";
  ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_nofollow";
  ALTER TABLE "services" DROP COLUMN IF EXISTS "meta_canonical_url";
  ALTER TABLE "services_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "_services_v" DROP COLUMN IF EXISTS "version_meta_noindex";
  ALTER TABLE "_services_v" DROP COLUMN IF EXISTS "version_meta_nofollow";
  ALTER TABLE "_services_v" DROP COLUMN IF EXISTS "version_meta_canonical_url";
  ALTER TABLE "_services_v_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_id";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "twitter_creator";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "position";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "shape";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "size";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "variant";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "color_scheme";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "layout";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "max_width";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_search";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_theme_toggle";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_theme_selector";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_language_switcher";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_social_links";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_mobile_menu";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_active_state";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "hide_logo";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "show_scroll_progress";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "scroll_progress_position";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "auto_hide";
  ALTER TABLE "header" DROP COLUMN IF EXISTS "invert_on_return";
  ALTER TABLE "header_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "layout";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "columns";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "background";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "max_width";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "show_social";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "show_copyright";
  ALTER TABLE "footer" DROP COLUMN IF EXISTS "hide_logo";
  ALTER TABLE "footer_locales" DROP COLUMN IF EXISTS "tagline";
  ALTER TABLE "footer_rels" DROP COLUMN IF EXISTS "projects_id";
  DROP TYPE IF EXISTS "public"."enum_pages_floating_variant";
  DROP TYPE IF EXISTS "public"."enum__pages_v_version_floating_variant";
  DROP TYPE IF EXISTS "public"."enum_posts_comments";
  DROP TYPE IF EXISTS "public"."enum_posts_blog_image_overlay";
  DROP TYPE IF EXISTS "public"."enum__posts_v_version_comments";
  DROP TYPE IF EXISTS "public"."enum__posts_v_version_blog_image_overlay";
  DROP TYPE IF EXISTS "public"."enum_header_position";
  DROP TYPE IF EXISTS "public"."enum_header_shape";
  DROP TYPE IF EXISTS "public"."enum_header_size";
  DROP TYPE IF EXISTS "public"."enum_header_variant";
  DROP TYPE IF EXISTS "public"."enum_header_color_scheme";
  DROP TYPE IF EXISTS "public"."enum_header_layout";
  DROP TYPE IF EXISTS "public"."enum_header_max_width";
  DROP TYPE IF EXISTS "public"."enum_header_scroll_progress_position";
  DROP TYPE IF EXISTS "public"."enum_footer_link_groups_links_link_type";
  DROP TYPE IF EXISTS "public"."enum_footer_layout";
  DROP TYPE IF EXISTS "public"."enum_footer_columns";
  DROP TYPE IF EXISTS "public"."enum_footer_background";
  DROP TYPE IF EXISTS "public"."enum_footer_max_width";
  DROP TYPE IF EXISTS "public"."enum_site_settings_enabled_themes";
  DROP TYPE IF EXISTS "public"."enum_site_settings_default_theme";
  DROP TYPE IF EXISTS "public"."enum_site_settings_default_color_mode";
  DROP TYPE IF EXISTS "public"."enum_site_settings_toc_layout";
  DROP TYPE IF EXISTS "public"."enum_site_settings_toc_sidebar_position";
  DROP TYPE IF EXISTS "public"."enum_site_settings_toc_max_depth";
  DROP TYPE IF EXISTS "public"."enum_site_settings_comments_provider";
  DROP TYPE IF EXISTS "public"."enum_site_settings_comments_giscus_mapping";
  DROP TYPE IF EXISTS "public"."enum_site_settings_comments_giscus_input_position";
  DROP TYPE IF EXISTS "public"."enum_site_settings_comments_cusdis_theme";`)
}

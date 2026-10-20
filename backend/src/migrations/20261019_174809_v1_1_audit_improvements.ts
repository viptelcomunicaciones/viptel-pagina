import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_nav_items_children_link_type" AS ENUM('reference', 'custom');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_header_cta_link_type" AS ENUM('reference', 'custom');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('reference', 'custom');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;
  CREATE TABLE IF NOT EXISTS "services_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_services_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"priority" numeric,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "search_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"projects_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "header_nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_children_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "header_locales" (
  	"cta_show_cta" boolean DEFAULT false,
  	"cta_link_type" "enum_header_cta_link_type" DEFAULT 'reference',
  	"cta_link_new_tab" boolean,
  	"cta_link_url" varchar,
  	"cta_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_locales" (
  	"copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "forms_locales" ADD COLUMN IF NOT EXISTS "title" varchar DEFAULT '' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "search_id" integer;
  DO $$ BEGIN
    ALTER TABLE "services_blocks_form_block" ADD CONSTRAINT "services_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "services_blocks_form_block" ADD CONSTRAINT "services_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "_services_v_blocks_form_block" ADD CONSTRAINT "_services_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "_services_v_blocks_form_block" ADD CONSTRAINT "_services_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "services_blocks_form_block_order_idx" ON "services_blocks_form_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "services_blocks_form_block_parent_id_idx" ON "services_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "services_blocks_form_block_path_idx" ON "services_blocks_form_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "services_blocks_form_block_locale_idx" ON "services_blocks_form_block" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "services_blocks_form_block_form_idx" ON "services_blocks_form_block" USING btree ("form_id");
  CREATE INDEX IF NOT EXISTS "_services_v_blocks_form_block_order_idx" ON "_services_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_services_v_blocks_form_block_parent_id_idx" ON "_services_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_services_v_blocks_form_block_path_idx" ON "_services_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_services_v_blocks_form_block_locale_idx" ON "_services_v_blocks_form_block" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "_services_v_blocks_form_block_form_idx" ON "_services_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX IF NOT EXISTS "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "search_rels_projects_id_idx" ON "search_rels" USING btree ("projects_id");
  CREATE INDEX IF NOT EXISTS "search_rels_services_id_idx" ON "search_rels" USING btree ("services_id");
  CREATE INDEX IF NOT EXISTS "header_nav_items_children_order_idx" ON "header_nav_items_children" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "header_nav_items_children_parent_id_idx" ON "header_nav_items_children" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "header_nav_items_children_locale_idx" ON "header_nav_items_children" USING btree ("_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_legal_links_locale_idx" ON "footer_legal_links" USING btree ("_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "projects_year_idx" ON "projects" USING btree ("year");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_year_idx" ON "_projects_v" USING btree ("version_year");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'title'
    ) THEN
      UPDATE "forms_locales" fl
      SET "title" = f."title"
      FROM "forms" f
      WHERE fl."_parent_id" = f."id" AND (fl."title" IS NULL OR fl."title" = '');
    END IF;
  END $$;
  ALTER TABLE "forms" DROP COLUMN IF EXISTS "title";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "services_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "_services_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "search" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "search_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "search_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "header_nav_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "header_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS "footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_search_fk";
  DROP TABLE IF EXISTS "services_blocks_form_block" CASCADE;
  DROP TABLE IF EXISTS "_services_v_blocks_form_block" CASCADE;
  DROP TABLE IF EXISTS "search" CASCADE;
  DROP TABLE IF EXISTS "search_locales" CASCADE;
  DROP TABLE IF EXISTS "search_rels" CASCADE;
  DROP TABLE IF EXISTS "header_nav_items_children" CASCADE;
  DROP TABLE IF EXISTS "header_locales" CASCADE;
  DROP TABLE IF EXISTS "footer_legal_links" CASCADE;
  DROP TABLE IF EXISTS "footer_locales" CASCADE;
  DROP INDEX IF EXISTS "projects_year_idx";
  DROP INDEX IF EXISTS "_projects_v_version_version_year_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_search_id_idx";
  ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "title" varchar DEFAULT '' NOT NULL;
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'forms_locales' AND column_name = 'title'
    ) THEN
      UPDATE "forms" f
      SET "title" = COALESCE(
        (SELECT fl."title" FROM "forms_locales" fl WHERE fl."_parent_id" = f."id" AND fl."title" <> '' ORDER BY fl."_locale" LIMIT 1),
        f."title"
      );
    END IF;
  END $$;
  ALTER TABLE "forms_locales" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "search_id";
  DROP TYPE IF EXISTS "public"."enum_header_nav_items_children_link_type";
  DROP TYPE IF EXISTS "public"."enum_header_cta_link_type";
  DROP TYPE IF EXISTS "public"."enum_footer_legal_links_link_type";`)
}


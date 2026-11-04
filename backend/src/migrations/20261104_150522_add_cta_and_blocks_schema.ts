import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_variant" AS ENUM('default', 'invert', 'glitch', 'banner');
  CREATE TYPE "public"."enum_pages_blocks_pricing_plans_interval" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum_pages_header_style" AS ENUM('bar', 'floating', 'transparent');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_variant" AS ENUM('default', 'invert', 'glitch', 'banner');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_plans_interval" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum__pages_v_version_header_style" AS ENUM('bar', 'floating', 'transparent');
  CREATE TYPE "public"."enum_services_blocks_cta_variant" AS ENUM('default', 'invert', 'glitch', 'banner');
  CREATE TYPE "public"."enum_services_blocks_pricing_plans_interval" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum__services_v_blocks_cta_variant" AS ENUM('default', 'invert', 'glitch', 'banner');
  CREATE TYPE "public"."enum__services_v_blocks_pricing_plans_interval" AS ENUM('one-time', 'monthly');
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum_pages_hero_links_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'split';
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'centeredHalo';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'split';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'centeredHalo';
  ALTER TYPE "public"."enum_services_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum_services_blocks_content_columns_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum_services_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  ALTER TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" ADD VALUE 'secondary' BEFORE 'outline';
  ALTER TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" ADD VALUE 'brand-outline';
  ALTER TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" ADD VALUE 'ghost';
  CREATE TABLE "pages_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "pages_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum_pages_blocks_pricing_plans_interval",
  	"highlighted" boolean DEFAULT false,
  	"link_text" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum__pages_v_blocks_pricing_plans_interval",
  	"highlighted" boolean DEFAULT false,
  	"link_text" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "services_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "services_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum_services_blocks_pricing_plans_interval",
  	"highlighted" boolean DEFAULT false,
  	"link_text" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum__services_v_blocks_pricing_plans_interval",
  	"highlighted" boolean DEFAULT false,
  	"link_text" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "variant" "enum_pages_blocks_cta_variant" DEFAULT 'default';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "badge" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages" ADD COLUMN "header_style" "enum_pages_header_style" DEFAULT 'bar';
  ALTER TABLE "pages_locales" ADD COLUMN "hero_badge" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_badge_icon" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "variant" "enum__pages_v_blocks_cta_variant" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "badge" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_header_style" "enum__pages_v_version_header_style" DEFAULT 'bar';
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_badge" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_badge_icon" varchar;
  ALTER TABLE "services_blocks_cta" ADD COLUMN "variant" "enum_services_blocks_cta_variant" DEFAULT 'default';
  ALTER TABLE "services_blocks_cta" ADD COLUMN "badge" varchar;
  ALTER TABLE "services_blocks_cta" ADD COLUMN "heading" varchar;
  ALTER TABLE "services_blocks_pricing" ADD COLUMN "heading" varchar;
  ALTER TABLE "_services_v_blocks_cta" ADD COLUMN "variant" "enum__services_v_blocks_cta_variant" DEFAULT 'default';
  ALTER TABLE "_services_v_blocks_cta" ADD COLUMN "badge" varchar;
  ALTER TABLE "_services_v_blocks_cta" ADD COLUMN "heading" varchar;
  ALTER TABLE "_services_v_blocks_pricing" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_pricing_plans_features" ADD CONSTRAINT "pages_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_plans" ADD CONSTRAINT "pages_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans_features" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_plans_features" ADD CONSTRAINT "services_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_plans" ADD CONSTRAINT "services_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_plans_features" ADD CONSTRAINT "_services_v_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_plans" ADD CONSTRAINT "_services_v_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_pricing_plans_features_order_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_features_parent_id_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_features_locale_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_plans_order_idx" ON "pages_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_parent_id_idx" ON "pages_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_locale_idx" ON "pages_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_order_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_parent_id_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_locale_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_plans_order_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_parent_id_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_locale_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_plans_features_order_idx" ON "services_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_plans_features_parent_id_idx" ON "services_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_plans_features_locale_idx" ON "services_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_plans_order_idx" ON "services_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_plans_parent_id_idx" ON "services_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_plans_locale_idx" ON "services_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_plans_features_order_idx" ON "_services_v_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_plans_features_parent_id_idx" ON "_services_v_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_plans_features_locale_idx" ON "_services_v_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_plans_order_idx" ON "_services_v_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_plans_parent_id_idx" ON "_services_v_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_plans_locale_idx" ON "_services_v_blocks_pricing_plans" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_plans" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans" CASCADE;
  DROP TABLE "services_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "services_blocks_pricing_plans" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_plans" CASCADE;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum_pages_hero_links_link_appearance";
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum_pages_hero_links_link_appearance" USING "link_appearance"::"public"."enum_pages_hero_links_link_appearance";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum_pages_blocks_content_columns_link_appearance";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum_pages_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum_pages_blocks_content_columns_link_appearance";
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum__pages_v_version_hero_links_link_appearance";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum__pages_v_version_hero_links_link_appearance" USING "link_appearance"::"public"."enum__pages_v_version_hero_links_link_appearance";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum__pages_v_blocks_content_columns_link_appearance";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum__pages_v_blocks_content_columns_link_appearance";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "services_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "services_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_services_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum_services_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "services_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum_services_blocks_content_columns_link_appearance";
  ALTER TABLE "services_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum_services_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum_services_blocks_content_columns_link_appearance";
  ALTER TABLE "_services_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE text;
  ALTER TABLE "_services_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum__services_v_blocks_content_columns_link_appearance";
  CREATE TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  ALTER TABLE "_services_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DEFAULT 'default'::"public"."enum__services_v_blocks_content_columns_link_appearance";
  ALTER TABLE "_services_v_blocks_content_columns" ALTER COLUMN "link_appearance" SET DATA TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" USING "link_appearance"::"public"."enum__services_v_blocks_content_columns_link_appearance";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "badge";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "heading";
  ALTER TABLE "pages" DROP COLUMN "header_style";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_badge";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_badge_icon";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "badge";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "heading";
  ALTER TABLE "_pages_v" DROP COLUMN "version_header_style";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_badge";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_badge_icon";
  ALTER TABLE "services_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "services_blocks_cta" DROP COLUMN "badge";
  ALTER TABLE "services_blocks_cta" DROP COLUMN "heading";
  ALTER TABLE "services_blocks_pricing" DROP COLUMN "heading";
  ALTER TABLE "_services_v_blocks_cta" DROP COLUMN "variant";
  ALTER TABLE "_services_v_blocks_cta" DROP COLUMN "badge";
  ALTER TABLE "_services_v_blocks_cta" DROP COLUMN "heading";
  ALTER TABLE "_services_v_blocks_pricing" DROP COLUMN "heading";
  DROP TYPE "public"."enum_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_pricing_plans_interval";
  DROP TYPE "public"."enum_pages_header_style";
  DROP TYPE "public"."enum__pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_plans_interval";
  DROP TYPE "public"."enum__pages_v_version_header_style";
  DROP TYPE "public"."enum_services_blocks_cta_variant";
  DROP TYPE "public"."enum_services_blocks_pricing_plans_interval";
  DROP TYPE "public"."enum__services_v_blocks_cta_variant";
  DROP TYPE "public"."enum__services_v_blocks_pricing_plans_interval";`)
}

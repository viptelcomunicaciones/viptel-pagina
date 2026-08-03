import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_services_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_services_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_services_blocks_pricing_interval" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum_services_blocks_media_content_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__services_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__services_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__services_v_blocks_pricing_interval" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum__services_v_blocks_media_content_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('es', 'en');
  CREATE TABLE "services_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon_id" integer
  );
  
  CREATE TABLE "services_pricing_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar
  );
  
  CREATE TABLE "services_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plan_name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"period" varchar DEFAULT '/mes',
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "services_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar
  );
  
  CREATE TABLE "services_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_services_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_services_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "services_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_services_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_services_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_services_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "services_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "services_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "services_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricing_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "services_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum_services_blocks_pricing_interval",
  	"link_text" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "services_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_media_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_position" "enum_services_blocks_media_content_image_position" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"icon_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"posts_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "_services_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"icon_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_pricing_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"plan_name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"period" varchar DEFAULT '/mes',
  	"highlighted" boolean DEFAULT false,
  	"cta_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__services_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__services_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__services_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__services_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__services_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"included" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"currency" varchar DEFAULT 'COP',
  	"interval" "enum__services_v_blocks_pricing_interval",
  	"link_text" varchar,
  	"link_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_media_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"image_position" "enum__services_v_blocks_media_content_image_position" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_icon_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"posts_id" integer,
  	"services_id" integer
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "header_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "services_features" ADD CONSTRAINT "services_features_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_features" ADD CONSTRAINT "services_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_pricing_features" ADD CONSTRAINT "services_pricing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_pricing" ADD CONSTRAINT "services_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta_links" ADD CONSTRAINT "services_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta" ADD CONSTRAINT "services_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_content_columns" ADD CONSTRAINT "services_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_content" ADD CONSTRAINT "services_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq_items" ADD CONSTRAINT "services_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq" ADD CONSTRAINT "services_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_images" ADD CONSTRAINT "services_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_images" ADD CONSTRAINT "services_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery" ADD CONSTRAINT "services_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_features" ADD CONSTRAINT "services_blocks_pricing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing" ADD CONSTRAINT "services_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_cards" ADD CONSTRAINT "services_blocks_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards" ADD CONSTRAINT "services_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_media_content" ADD CONSTRAINT "services_blocks_media_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_media_content" ADD CONSTRAINT "services_blocks_media_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_pricing_features" ADD CONSTRAINT "_services_v_version_pricing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_pricing" ADD CONSTRAINT "_services_v_version_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faq" ADD CONSTRAINT "_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_gallery" ADD CONSTRAINT "_services_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_gallery" ADD CONSTRAINT "_services_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta_links" ADD CONSTRAINT "_services_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta" ADD CONSTRAINT "_services_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_content_columns" ADD CONSTRAINT "_services_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_content" ADD CONSTRAINT "_services_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq_items" ADD CONSTRAINT "_services_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq" ADD CONSTRAINT "_services_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_images" ADD CONSTRAINT "_services_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_images" ADD CONSTRAINT "_services_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery" ADD CONSTRAINT "_services_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_features" ADD CONSTRAINT "_services_v_blocks_pricing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing" ADD CONSTRAINT "_services_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_cards" ADD CONSTRAINT "_services_v_blocks_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards" ADD CONSTRAINT "_services_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_media_content" ADD CONSTRAINT "_services_v_blocks_media_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_media_content" ADD CONSTRAINT "_services_v_blocks_media_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_parent_id_services_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_icon_id_media_id_fk" FOREIGN KEY ("version_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_features_order_idx" ON "services_features" USING btree ("_order");
  CREATE INDEX "services_features_parent_id_idx" ON "services_features" USING btree ("_parent_id");
  CREATE INDEX "services_features_locale_idx" ON "services_features" USING btree ("_locale");
  CREATE INDEX "services_features_icon_idx" ON "services_features" USING btree ("icon_id");
  CREATE INDEX "services_pricing_features_order_idx" ON "services_pricing_features" USING btree ("_order");
  CREATE INDEX "services_pricing_features_parent_id_idx" ON "services_pricing_features" USING btree ("_parent_id");
  CREATE INDEX "services_pricing_features_locale_idx" ON "services_pricing_features" USING btree ("_locale");
  CREATE INDEX "services_pricing_order_idx" ON "services_pricing" USING btree ("_order");
  CREATE INDEX "services_pricing_parent_id_idx" ON "services_pricing" USING btree ("_parent_id");
  CREATE INDEX "services_pricing_locale_idx" ON "services_pricing" USING btree ("_locale");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE INDEX "services_faq_locale_idx" ON "services_faq" USING btree ("_locale");
  CREATE INDEX "services_gallery_order_idx" ON "services_gallery" USING btree ("_order");
  CREATE INDEX "services_gallery_parent_id_idx" ON "services_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_gallery_image_idx" ON "services_gallery" USING btree ("image_id");
  CREATE INDEX "services_blocks_cta_links_order_idx" ON "services_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_links_parent_id_idx" ON "services_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_links_locale_idx" ON "services_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "services_blocks_cta_order_idx" ON "services_blocks_cta" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_parent_id_idx" ON "services_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_path_idx" ON "services_blocks_cta" USING btree ("_path");
  CREATE INDEX "services_blocks_cta_locale_idx" ON "services_blocks_cta" USING btree ("_locale");
  CREATE INDEX "services_blocks_content_columns_order_idx" ON "services_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "services_blocks_content_columns_parent_id_idx" ON "services_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_content_columns_locale_idx" ON "services_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "services_blocks_content_order_idx" ON "services_blocks_content" USING btree ("_order");
  CREATE INDEX "services_blocks_content_parent_id_idx" ON "services_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_content_path_idx" ON "services_blocks_content" USING btree ("_path");
  CREATE INDEX "services_blocks_content_locale_idx" ON "services_blocks_content" USING btree ("_locale");
  CREATE INDEX "services_blocks_faq_items_order_idx" ON "services_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_items_parent_id_idx" ON "services_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_items_locale_idx" ON "services_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_faq_order_idx" ON "services_blocks_faq" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_parent_id_idx" ON "services_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_path_idx" ON "services_blocks_faq" USING btree ("_path");
  CREATE INDEX "services_blocks_faq_locale_idx" ON "services_blocks_faq" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_images_order_idx" ON "services_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_images_parent_id_idx" ON "services_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_images_locale_idx" ON "services_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_images_image_idx" ON "services_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "services_blocks_gallery_order_idx" ON "services_blocks_gallery" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_parent_id_idx" ON "services_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_path_idx" ON "services_blocks_gallery" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_locale_idx" ON "services_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_features_order_idx" ON "services_blocks_pricing_features" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_features_parent_id_idx" ON "services_blocks_pricing_features" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_features_locale_idx" ON "services_blocks_pricing_features" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_order_idx" ON "services_blocks_pricing" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_parent_id_idx" ON "services_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_path_idx" ON "services_blocks_pricing" USING btree ("_path");
  CREATE INDEX "services_blocks_pricing_locale_idx" ON "services_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_cards_order_idx" ON "services_blocks_cards_cards" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_cards_parent_id_idx" ON "services_blocks_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_cards_locale_idx" ON "services_blocks_cards_cards" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_order_idx" ON "services_blocks_cards" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_parent_id_idx" ON "services_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_path_idx" ON "services_blocks_cards" USING btree ("_path");
  CREATE INDEX "services_blocks_cards_locale_idx" ON "services_blocks_cards" USING btree ("_locale");
  CREATE INDEX "services_blocks_media_content_order_idx" ON "services_blocks_media_content" USING btree ("_order");
  CREATE INDEX "services_blocks_media_content_parent_id_idx" ON "services_blocks_media_content" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_media_content_path_idx" ON "services_blocks_media_content" USING btree ("_path");
  CREATE INDEX "services_blocks_media_content_locale_idx" ON "services_blocks_media_content" USING btree ("_locale");
  CREATE INDEX "services_blocks_media_content_image_idx" ON "services_blocks_media_content" USING btree ("image_id");
  CREATE INDEX "services_parent_idx" ON "services" USING btree ("parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_icon_idx" ON "services" USING btree ("icon_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_meta_meta_image_idx" ON "services_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_locale_idx" ON "services_rels" USING btree ("locale");
  CREATE INDEX "services_rels_pages_id_idx" ON "services_rels" USING btree ("pages_id","locale");
  CREATE INDEX "services_rels_posts_id_idx" ON "services_rels" USING btree ("posts_id","locale");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id","locale");
  CREATE INDEX "_services_v_version_features_order_idx" ON "_services_v_version_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_features_parent_id_idx" ON "_services_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_features_locale_idx" ON "_services_v_version_features" USING btree ("_locale");
  CREATE INDEX "_services_v_version_features_icon_idx" ON "_services_v_version_features" USING btree ("icon_id");
  CREATE INDEX "_services_v_version_pricing_features_order_idx" ON "_services_v_version_pricing_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_pricing_features_parent_id_idx" ON "_services_v_version_pricing_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_pricing_features_locale_idx" ON "_services_v_version_pricing_features" USING btree ("_locale");
  CREATE INDEX "_services_v_version_pricing_order_idx" ON "_services_v_version_pricing" USING btree ("_order");
  CREATE INDEX "_services_v_version_pricing_parent_id_idx" ON "_services_v_version_pricing" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_pricing_locale_idx" ON "_services_v_version_pricing" USING btree ("_locale");
  CREATE INDEX "_services_v_version_faq_order_idx" ON "_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_services_v_version_faq_parent_id_idx" ON "_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faq_locale_idx" ON "_services_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_services_v_version_gallery_order_idx" ON "_services_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_services_v_version_gallery_parent_id_idx" ON "_services_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_gallery_image_idx" ON "_services_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_services_v_blocks_cta_links_order_idx" ON "_services_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_links_parent_id_idx" ON "_services_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_links_locale_idx" ON "_services_v_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cta_order_idx" ON "_services_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_parent_id_idx" ON "_services_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_path_idx" ON "_services_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cta_locale_idx" ON "_services_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_content_columns_order_idx" ON "_services_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_content_columns_parent_id_idx" ON "_services_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_content_columns_locale_idx" ON "_services_v_blocks_content_columns" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_content_order_idx" ON "_services_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_content_parent_id_idx" ON "_services_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_content_path_idx" ON "_services_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_content_locale_idx" ON "_services_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_faq_items_order_idx" ON "_services_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_items_parent_id_idx" ON "_services_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_items_locale_idx" ON "_services_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_faq_order_idx" ON "_services_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_parent_id_idx" ON "_services_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_path_idx" ON "_services_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_faq_locale_idx" ON "_services_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_images_order_idx" ON "_services_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_images_parent_id_idx" ON "_services_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_images_locale_idx" ON "_services_v_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_images_image_idx" ON "_services_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_services_v_blocks_gallery_order_idx" ON "_services_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_parent_id_idx" ON "_services_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_path_idx" ON "_services_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_locale_idx" ON "_services_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_features_order_idx" ON "_services_v_blocks_pricing_features" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_features_parent_id_idx" ON "_services_v_blocks_pricing_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_features_locale_idx" ON "_services_v_blocks_pricing_features" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_order_idx" ON "_services_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_parent_id_idx" ON "_services_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_path_idx" ON "_services_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricing_locale_idx" ON "_services_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_cards_order_idx" ON "_services_v_blocks_cards_cards" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_cards_parent_id_idx" ON "_services_v_blocks_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_cards_locale_idx" ON "_services_v_blocks_cards_cards" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_order_idx" ON "_services_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_parent_id_idx" ON "_services_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_path_idx" ON "_services_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cards_locale_idx" ON "_services_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_media_content_order_idx" ON "_services_v_blocks_media_content" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_media_content_parent_id_idx" ON "_services_v_blocks_media_content" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_media_content_path_idx" ON "_services_v_blocks_media_content" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_media_content_locale_idx" ON "_services_v_blocks_media_content" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_media_content_image_idx" ON "_services_v_blocks_media_content" USING btree ("image_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_parent_idx" ON "_services_v" USING btree ("version_parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_icon_idx" ON "_services_v" USING btree ("version_icon_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE INDEX "_services_v_version_meta_version_meta_image_idx" ON "_services_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_locale_idx" ON "_services_v_rels" USING btree ("locale");
  CREATE INDEX "_services_v_rels_pages_id_idx" ON "_services_v_rels" USING btree ("pages_id","locale");
  CREATE INDEX "_services_v_rels_posts_id_idx" ON "_services_v_rels" USING btree ("posts_id","locale");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id","locale");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id","locale");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "header_rels_services_id_idx" ON "header_rels" USING btree ("services_id","locale");
  CREATE INDEX "footer_rels_services_id_idx" ON "footer_rels" USING btree ("services_id","locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_pricing_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_media_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_pricing_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_media_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_features" CASCADE;
  DROP TABLE "services_pricing_features" CASCADE;
  DROP TABLE "services_pricing" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services_gallery" CASCADE;
  DROP TABLE "services_blocks_cta_links" CASCADE;
  DROP TABLE "services_blocks_cta" CASCADE;
  DROP TABLE "services_blocks_content_columns" CASCADE;
  DROP TABLE "services_blocks_content" CASCADE;
  DROP TABLE "services_blocks_faq_items" CASCADE;
  DROP TABLE "services_blocks_faq" CASCADE;
  DROP TABLE "services_blocks_gallery_images" CASCADE;
  DROP TABLE "services_blocks_gallery" CASCADE;
  DROP TABLE "services_blocks_pricing_features" CASCADE;
  DROP TABLE "services_blocks_pricing" CASCADE;
  DROP TABLE "services_blocks_cards_cards" CASCADE;
  DROP TABLE "services_blocks_cards" CASCADE;
  DROP TABLE "services_blocks_media_content" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_features" CASCADE;
  DROP TABLE "_services_v_version_pricing_features" CASCADE;
  DROP TABLE "_services_v_version_pricing" CASCADE;
  DROP TABLE "_services_v_version_faq" CASCADE;
  DROP TABLE "_services_v_version_gallery" CASCADE;
  DROP TABLE "_services_v_blocks_cta_links" CASCADE;
  DROP TABLE "_services_v_blocks_cta" CASCADE;
  DROP TABLE "_services_v_blocks_content_columns" CASCADE;
  DROP TABLE "_services_v_blocks_content" CASCADE;
  DROP TABLE "_services_v_blocks_faq_items" CASCADE;
  DROP TABLE "_services_v_blocks_faq" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_services_v_blocks_gallery" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_features" CASCADE;
  DROP TABLE "_services_v_blocks_pricing" CASCADE;
  DROP TABLE "_services_v_blocks_cards_cards" CASCADE;
  DROP TABLE "_services_v_blocks_cards" CASCADE;
  DROP TABLE "_services_v_blocks_media_content" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_services_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_services_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_services_fk";
  
  DROP INDEX "pages_rels_services_id_idx";
  DROP INDEX "_pages_v_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "header_rels_services_id_idx";
  DROP INDEX "footer_rels_services_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "services_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "header_rels" DROP COLUMN "services_id";
  ALTER TABLE "footer_rels" DROP COLUMN "services_id";
  DROP TYPE "public"."enum_services_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_services_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_services_blocks_content_columns_size";
  DROP TYPE "public"."enum_services_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_services_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_services_blocks_pricing_interval";
  DROP TYPE "public"."enum_services_blocks_media_content_image_position";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__services_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__services_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__services_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__services_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__services_v_blocks_pricing_interval";
  DROP TYPE "public"."enum__services_v_blocks_media_content_image_position";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";`)
}

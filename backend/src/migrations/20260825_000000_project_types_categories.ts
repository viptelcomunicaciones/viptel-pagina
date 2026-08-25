import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "project_types" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"generate_slug" boolean DEFAULT true,
   	"slug" varchar NOT NULL,
   	"icon" varchar,
   	"position" numeric DEFAULT 0,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "project_types_locales" (
   	"title" varchar NOT NULL,
   	"description" varchar,
   	"id" serial PRIMARY KEY NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"_parent_id" integer NOT NULL
   );

   CREATE INDEX "project_types_slug_idx" ON "project_types" USING btree ("slug");
   CREATE INDEX "project_types_updated_at_idx" ON "project_types" USING btree ("updated_at");
   CREATE INDEX "project_types_created_at_idx" ON "project_types" USING btree ("created_at");
   CREATE UNIQUE INDEX "project_types_locales_locale_parent_id_unique" ON "project_types_locales" USING btree ("_locale", "_parent_id");

   ALTER TABLE "project_types_locales" ADD CONSTRAINT "project_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_types"("id") ON DELETE cascade ON UPDATE no action;

   CREATE TABLE "project_categories" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"generate_slug" boolean DEFAULT true,
   	"slug" varchar NOT NULL,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"parent_id" integer
   );

   CREATE TABLE "project_categories_locales" (
   	"title" varchar NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"_parent_id" integer NOT NULL
   );

   CREATE INDEX "project_categories_slug_idx" ON "project_categories" USING btree ("slug");
   CREATE INDEX "project_categories_updated_at_idx" ON "project_categories" USING btree ("updated_at");
   CREATE INDEX "project_categories_created_at_idx" ON "project_categories" USING btree ("created_at");
   CREATE INDEX "project_categories_parent_idx" ON "project_categories" USING btree ("parent_id");
   CREATE UNIQUE INDEX "project_categories_locales_locale_parent_id_unique" ON "project_categories_locales" USING btree ("_locale", "_parent_id");

   ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_parent_id_project_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "project_categories_locales" ADD CONSTRAINT "project_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;

   ALTER TABLE "projects" ADD COLUMN "project_type_id" integer;
   ALTER TABLE "projects" ADD COLUMN "categories_id" integer;
   CREATE INDEX "projects_project_type_idx" ON "projects" USING btree ("project_type_id");
   CREATE INDEX "projects_categories_idx" ON "projects" USING btree ("categories_id");
   ALTER TABLE "projects" ADD CONSTRAINT "projects_project_type_id_project_types_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."project_types"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "projects" ADD CONSTRAINT "projects_categories_id_project_categories_id_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;

   ALTER TABLE "_projects_v" ADD COLUMN "version_project_type_id" integer;
   ALTER TABLE "_projects_v" ADD COLUMN "version_categories_id" integer;
   CREATE INDEX "_projects_v_version_version_project_type_idx" ON "_projects_v" USING btree ("version_project_type_id");
   CREATE INDEX "_projects_v_version_version_categories_idx" ON "_projects_v" USING btree ("version_categories_id");
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_project_type_id_project_types_id_fk" FOREIGN KEY ("version_project_type_id") REFERENCES "public"."project_types"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_categories_id_project_categories_id_fk" FOREIGN KEY ("version_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_categories_id_project_categories_id_fk";
   DROP INDEX "_projects_v_version_version_categories_idx";
   ALTER TABLE "_projects_v" DROP COLUMN "version_categories_id";
   ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_project_type_id_project_types_id_fk";
   DROP INDEX "_projects_v_version_version_project_type_idx";
   ALTER TABLE "_projects_v" DROP COLUMN "version_project_type_id";

   ALTER TABLE "projects" DROP CONSTRAINT "projects_categories_id_project_categories_id_fk";
   DROP INDEX "projects_categories_idx";
   ALTER TABLE "projects" DROP COLUMN "categories_id";
   ALTER TABLE "projects" DROP CONSTRAINT "projects_project_type_id_project_types_id_fk";
   DROP INDEX "projects_project_type_idx";
   ALTER TABLE "projects" DROP COLUMN "project_type_id";

   ALTER TABLE "project_categories_locales" DROP CONSTRAINT "project_categories_locales_parent_id_fk";
   ALTER TABLE "project_categories" DROP CONSTRAINT "project_categories_parent_id_project_categories_id_fk";
   DROP TABLE "project_categories_locales" CASCADE;
   DROP TABLE "project_categories" CASCADE;

   ALTER TABLE "project_types_locales" DROP CONSTRAINT "project_types_locales_parent_id_fk";
   DROP TABLE "project_types_locales" CASCADE;
   DROP TABLE "project_types" CASCADE;`)
}
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tags" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"name" varchar NOT NULL,
   	"generate_slug" boolean DEFAULT true,
   	"slug" varchar NOT NULL,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   ALTER TABLE "posts_rels" ADD COLUMN "tags_id" integer;
   ALTER TABLE "_posts_v_rels" ADD COLUMN "tags_id" integer;
   ALTER TABLE "projects_rels" ADD COLUMN "tags_id" integer;
   ALTER TABLE "_projects_v_rels" ADD COLUMN "tags_id" integer;

   CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
   CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
   CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
   CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
   CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" USING btree ("tags_id");
   CREATE INDEX "projects_rels_tags_id_idx" ON "projects_rels" USING btree ("tags_id");
   CREATE INDEX "_projects_v_rels_tags_id_idx" ON "_projects_v_rels" USING btree ("tags_id");

   ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;

   DROP TABLE "posts_tags" CASCADE;
   DROP TABLE "_posts_v_version_tags" CASCADE;
   DROP TABLE "projects_tags" CASCADE;
   DROP TABLE "_projects_v_version_tags" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_tags" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"tag" varchar
   );

   CREATE TABLE "_posts_v_version_tags" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"tag" varchar,
   	"_uuid" varchar
   );

   CREATE TABLE "projects_tags" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"tag" varchar
   );

   CREATE TABLE "_projects_v_version_tags" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"tag" varchar,
   	"_uuid" varchar
   );

   ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_tags_fk";
   DROP INDEX "posts_rels_tags_id_idx";
   ALTER TABLE "posts_rels" DROP COLUMN "tags_id";
   ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_tags_fk";
   DROP INDEX "_posts_v_rels_tags_id_idx";
   ALTER TABLE "_posts_v_rels" DROP COLUMN "tags_id";
   ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_tags_fk";
   DROP INDEX "projects_rels_tags_id_idx";
   ALTER TABLE "projects_rels" DROP COLUMN "tags_id";
   ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_tags_fk";
   DROP INDEX "_projects_v_rels_tags_id_idx";
   ALTER TABLE "_projects_v_rels" DROP COLUMN "tags_id";

   DROP TABLE "tags" CASCADE;`)
}
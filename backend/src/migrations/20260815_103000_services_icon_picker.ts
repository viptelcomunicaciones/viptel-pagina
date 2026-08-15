import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_features" DROP CONSTRAINT "services_features_icon_id_media_id_fk";
  DROP INDEX "services_features_icon_idx";
  ALTER TABLE "services_features" RENAME COLUMN "icon_id" TO "icon";
  ALTER TABLE "services_features" ALTER COLUMN "icon" TYPE varchar USING "icon"::varchar;

  ALTER TABLE "services" DROP CONSTRAINT "services_icon_id_media_id_fk";
  DROP INDEX "services_icon_idx";
  ALTER TABLE "services" RENAME COLUMN "icon_id" TO "icon";
  ALTER TABLE "services" ALTER COLUMN "icon" TYPE varchar USING "icon"::varchar;

  ALTER TABLE "_services_v_version_features" DROP CONSTRAINT "_services_v_version_features_icon_id_media_id_fk";
  DROP INDEX "_services_v_version_features_icon_idx";
  ALTER TABLE "_services_v_version_features" RENAME COLUMN "icon_id" TO "icon";
  ALTER TABLE "_services_v_version_features" ALTER COLUMN "icon" TYPE varchar USING "icon"::varchar;

  ALTER TABLE "_services_v" DROP CONSTRAINT "_services_v_version_icon_id_media_id_fk";
  DROP INDEX "_services_v_version_version_icon_idx";
  ALTER TABLE "_services_v" RENAME COLUMN "version_icon_id" TO "version_icon";
  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" TYPE varchar USING "version_icon"::varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_features" ALTER COLUMN "icon" TYPE integer USING "icon"::integer;
  ALTER TABLE "services_features" RENAME COLUMN "icon" TO "icon_id";
  CREATE INDEX "services_features_icon_idx" ON "services_features" USING btree ("icon_id");
  ALTER TABLE "services_features" ADD CONSTRAINT "services_features_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "services" ALTER COLUMN "icon" TYPE integer USING "icon"::integer;
  ALTER TABLE "services" RENAME COLUMN "icon" TO "icon_id";
  CREATE INDEX "services_icon_idx" ON "services" USING btree ("icon_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "_services_v_version_features" ALTER COLUMN "icon" TYPE integer USING "icon"::integer;
  ALTER TABLE "_services_v_version_features" RENAME COLUMN "icon" TO "icon_id";
  CREATE INDEX "_services_v_version_features_icon_idx" ON "_services_v_version_features" USING btree ("icon_id");
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" TYPE integer USING "version_icon"::integer;
  ALTER TABLE "_services_v" RENAME COLUMN "version_icon" TO "version_icon_id";
  CREATE INDEX "_services_v_version_version_icon_idx" ON "_services_v" USING btree ("version_icon_id");
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_icon_id_media_id_fk" FOREIGN KEY ("version_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;`)
}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260801162005 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "anke_content_entry" ("id" text not null, "type" text not null, "ref" text null, "data" jsonb not null, "status" text not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "anke_content_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_anke_content_entry_deleted_at" ON "anke_content_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "anke_content_entry" cascade;`);
  }

}

import path from "path";
import { EntityGenerator } from "@mikro-orm/entity-generator";
import { Migrator } from "@mikro-orm/migrations";
import {
	Entity,
	MikroORM,
	Opt,
	Options,
	PrimaryKey,
	Property,
} from "@mikro-orm/mysql";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config({ path: path.join(__dirname, "../.env") });

@Entity()
export class Entity1 {
	@PrimaryKey()
	id!: number;

	@Property({ length: 150, default: "0" })
	name!: string & Opt;

	@Property({ default: 0 })
	aNumber!: number & Opt;

	@Property({ length: 0, defaultRaw: "CURRENT_TIMESTAMP" })
	dateCreate!: Date & Opt;

	@Property({ length: 0, defaultRaw: "CURRENT_TIMESTAMP" })
	dateUpdate!: Date & Opt;
}

@Entity()
export class Entity2 {
	@PrimaryKey()
	id!: number;

	@Property({ length: 150, default: "0" })
	name!: string;

	@Property({ default: 0 })
	aNumber!: number;

	@Property({ defaultRaw: "CURRENT_TIMESTAMP" })
	dateCreate!: Date;

	@Property({ defaultRaw: "CURRENT_TIMESTAMP" })
	dateUpdate!: Date;
}

const commonOptions = {
	dbName: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT ?? "", 10),
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	extensions: [Migrator, EntityGenerator],
	debug: false,
	allowGlobalContext: true, // only for testing
} satisfies Options;

beforeAll(async () => {
	const orm = await MikroORM.init({
		...commonOptions,
		entities: [],
		discovery: {
			warnWhenNoEntities: false,
		},
	});

	await orm.schema.refreshDatabase();
});

afterAll(async () => {
	const orm = await MikroORM.init({
		...commonOptions,
		entities: [],
		discovery: {
			warnWhenNoEntities: false,
		},
	});

	const migrator = orm.getMigrator();
	await migrator.down();
	await orm.close(true);

	await fs.rmdir(path.join(__dirname, "./migrations"), { recursive: true });
	await fs.rmdir(path.join(__dirname, "./error-migrations"), {
		recursive: true,
	});
});

test("Migration: create table with date field as varchar", async () => {
	const orm = await MikroORM.init({
		...commonOptions,
		entities: [Entity1],
		migrations: {
			path: path.join(__dirname, "./error-migrations"),
		},
	});

	const migrator = orm.getMigrator();
	const migration = await migrator.createMigration();
	const { up } = migration.diff;

	const isDateCreateVarchar = up.some((s) =>
		s.includes("`date_create` varchar"),
	);

	await orm.close(true);

	expect(isDateCreateVarchar).toBe(true);
});

test("Migration: create table with date field as datetime", async () => {
	const orm = await MikroORM.init({
		...commonOptions,
		entities: [Entity2],
	});

	const migrator = orm.getMigrator();
	const migration = await migrator.createMigration();
	const { up } = migration.diff;

	const isDateCreateDateTime = up.some((s) =>
		s.includes("`date_create` datetime"),
	);

	await migrator.up();
	await orm.close(true);

	expect(isDateCreateDateTime).toBe(true);
});

test("EntityGenerator: dateCreate with Opt type", async () => {
	const orm = await MikroORM.init({
		...commonOptions,
		entities: [Entity2],
	});

	const generator = orm.getEntityGenerator();
	const result = await generator.generate();

	expect(result[0].includes("dateCreate!: Date & Opt;")).toBe(true);
});

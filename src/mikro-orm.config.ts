import path from "path";
import { ReflectMetadataProvider } from "@mikro-orm/core";
import { EntityGenerator } from "@mikro-orm/entity-generator";
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/mysql";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, ".env") });

export default defineConfig({
	entities: ["./entities"],
	entitiesTs: [path.join(__dirname, "entities")],
	dbName: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT ?? "", 10),
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	metadataProvider: ReflectMetadataProvider,
	debug: true,
	extensions: [EntityGenerator, Migrator],
	migrations: {
		snapshot: false,
		emit: "ts",
		path: path.join(__dirname, "migrations"),
		pathTs: path.join(__dirname, "migrations"),
	},

	entityGenerator: {
		onInitialMetadata: (metadata) => {
			for (const meta of metadata) {
				for (const prop of meta.props) {
					if (
						prop.type.toLowerCase() === "date" ||
						prop.type.toLowerCase() === "datetime"
					) {
						prop.length = undefined;
						prop.optional = false;
					}
				}
			}
		},
	},
});

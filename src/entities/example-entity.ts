import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class SaAgendamentos {
	@PrimaryKey()
	id!: number;

	@Property({ length: 150, default: "0" })
	name!: string & Opt;

	@Property({ length: 0, defaultRaw: "CURRENT_TIMESTAMP" })
	dateCreate!: Date & Opt;

	@Property({ length: 0, defaultRaw: "CURRENT_TIMESTAMP" })
	dateUpdate!: Date & Opt;
}

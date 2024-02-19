import { Migration } from '@mikro-orm/migrations';

export class Migration20240219131148 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `sa_agendamentos` (`id` int unsigned not null auto_increment primary key, `name` varchar(150) not null default \'0\', `date_create` varchar(255) not null default CURRENT_TIMESTAMP, `date_update` varchar(255) not null default CURRENT_TIMESTAMP) default character set utf8mb4 engine = InnoDB;');
  }

}

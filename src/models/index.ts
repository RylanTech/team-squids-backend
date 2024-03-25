import { Sequelize } from "sequelize";
import { ChurchUserFactory} from "./churchUser";
import { ChurchFactory, AssociateUserChurch  } from "./church";
import { AssociateChurchEvent, EventFactory } from "./event";
import 'dotenv/config';
import { AssociateEventTrigger, TriggerFactory } from "./triggers";
import { UserFactory } from "./users";
import { ArticleFactory } from "./article";

const dbName = process.env.DB_NAME ?? '';
const username = process.env.DB_USER ?? '';
const password = process.env.DB_PASS ?? '';

const sequelize = new Sequelize(dbName, username, password, {
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql'
});

ChurchFactory(sequelize);
EventFactory(sequelize);
ChurchUserFactory(sequelize);
TriggerFactory(sequelize);
UserFactory(sequelize);
ArticleFactory(sequelize);
AssociateUserChurch();
AssociateChurchEvent();
AssociateEventTrigger();

export const db = sequelize;
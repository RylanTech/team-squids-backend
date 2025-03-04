import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from "sequelize";
import { Event } from "./event";

export class Trigger extends Model<
    InferAttributes<Trigger>,
    InferCreationAttributes<Trigger>
> {
    declare triggerId: number;
    declare eventId: number;
    declare churchId: number;
    declare date: Date;
    declare title: string;
    declare body: string;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

export function TriggerFactory(sequelize: Sequelize) {
    Trigger.init(
        {
            triggerId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            eventId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            churchId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            body: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            freezeTableName: true,
            tableName: "triggers",
            sequelize,
            collate: 'utf8_general_ci',
        }
    );
}
export function AssociateEventTrigger() {
    Event.hasMany(Trigger, { foreignKey: "eventId" });
    Trigger.belongsTo(Event, { foreignKey: "eventId" });
  }
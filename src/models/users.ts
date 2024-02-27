import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";


export class user extends Model<InferAttributes<user>, InferCreationAttributes<user>>{
    declare userId: number;
    declare phoneId: string;
    declare favArr: string;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

export function UserFactory(sequelize: Sequelize) {
    user.init({
        userId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        phoneId: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        favArr: {
            type: DataTypes.TEXT,
            allowNull: true,
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
            tableName: 'user',
            sequelize,
            collate: 'utf8_general_ci',
        })
}
// CREATE TABLE IF NOT EXISTS user (
//     userId INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
//     phoneId TEXT,
//     favArr TEXT,
//     createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


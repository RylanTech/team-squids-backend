import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from "sequelize";
export class Article extends Model<
    InferAttributes<Article>,
    InferCreationAttributes<Article>
> {
    declare ArticleId: number;
    declare title: string;
    declare body: string;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

export function ArticleFactory(sequelize: Sequelize) {
    Article.init(
        {
            ArticleId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            body: {
                type: DataTypes.TEXT,
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
            tableName: "articles",
            sequelize,
            collate: 'utf8_general_ci',
        }
    );
}
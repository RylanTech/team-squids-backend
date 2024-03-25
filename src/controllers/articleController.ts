import { RequestHandler } from "express";
import { verifyUser } from "../services/authService";
import { ChurchUser } from "../models/churchUser";
import { Article } from "../models/article";

export const getArticle: RequestHandler = async (req, res, next) => {
    try {
        let user: ChurchUser | null = await verifyUser(req);
        if (!user) {
            return res.status(200).send(false);
        }

        let articleId = req.params.id

        let article = await Article.findOne({
            where: { ArticleId: articleId }
        })

        if (article) {
            res.status(200).send(article)
        } else {
            res.status(404).send()
        }
    } catch (error: any) {
        res.status(500).send(error.message || "Some error occurred while getting the article");
    }
};

export const getArticles: RequestHandler = async (req, res, next) => {
    try {
        let user: ChurchUser | null = await verifyUser(req);
        if (!user) {
            return res.status(200).send(false);
        }

        let articles = await Article.findAll()


        articles.sort((a: any, b: any) => {
            const dateA = new Date(a.dataValues.updatedAt);
            const dateB = new Date(b.dataValues.updatedAt);
            return dateB.getTime() - dateA.getTime();
        });


        if (articles) {
            res.status(200).send(articles)
        } else {
            res.status(404).send()
        }
    } catch (error: any) {
        res.status(500).send(error.message || "Some error occurred while getting the article");
    }
};

export const createArticle: RequestHandler = async (req, res, next) => {
    try {
        let user: ChurchUser | null = await verifyUser(req);
        if (!user) {
            return res.status(401).send();
        }
        if (user.userType !== "admin") {
            return res.status(401).send("Not an admin user");
        }

        let newArticle: Article = req.body

        if (newArticle && newArticle.title && newArticle.body) {
            await Article.create(newArticle)
            res.status(201).send()
        } else {
            res.status(400).send()
        }


    } catch (error: any) {
        res.status(500).send(error.message || "Some error occurred while creating the article.");
    }
};

export const updateArticle: RequestHandler = async (req, res, next) => {
    try {
        let user: ChurchUser | null = await verifyUser(req);
        if (!user) {
            return res.status(403).send();
        }
        if (user.userType !== "admin") {
            return res.status(401).send("Not an admin user");
        }

        let newArticle: Article = req.body
        let articleId = req.params.id

        if (newArticle && newArticle.title && newArticle.body) {
            await Article.update(newArticle, {
                where: { ArticleId: articleId }
            })
            res.status(200).send()
        } else {
            res.status(400).send()
        }


    } catch (error: any) {
        res.status(500).send(error.message || "Some error occurred while editing the article.");
    }
};

export const deleteArticle: RequestHandler = async (req, res, next) => {
    try {
        let user: ChurchUser | null = await verifyUser(req);
        if (!user) {
            return res.status(403).send();
        }
        if (user.userType !== "admin") {
            return res.status(401).send("Not an admin user");
        }
        let articleId = req.params.id

        if (articleId) {
            await Article.destroy({
                where: { ArticleId: articleId }
            })
            res.status(200).send()
        } else {
            res.status(400).send()
        }


    } catch (error: any) {
        res.status(500).send(error.message || "Some error occurred while deleting the article.");
    }
};
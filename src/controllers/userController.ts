import { RequestHandler } from "express";
import { user } from "../models/users";

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        let newUser: user = req.body;

        if (newUser.phoneId && newUser.favArr) {
            newUser.favArr = JSON.stringify(newUser.favArr);

            let existingUsers = await user.findAll({
                where: { phoneId: newUser.phoneId },
            });

            if (existingUsers && existingUsers.length > 0) {
                // If there are multiple entries, delete all but one
                await user.destroy({
                    where: { phoneId: newUser.phoneId },
                    limit: existingUsers.length - 1,
                });

                console.log("Deleted duplicate entries for phoneId:", newUser.phoneId);
            }

            let created = await user.create(newUser);
            res.status(201).send(created);
        } else {
            res.status(400).send();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export const editUser: RequestHandler = async (req, res, next) => {
    try {
        let updatedUser: user = req.body
        if (updatedUser) {
            updatedUser.favArr = JSON.stringify(updatedUser.favArr)
            user.update(updatedUser, {
                where: {
                    phoneId: updatedUser.phoneId
                }
            })
            res.status(202).send(updatedUser)
        } else {
            let newUser = await user.create(updatedUser)
            res.send(201).send(newUser)
        }
    } catch {
        res.status(500).send()
    }
}

export const testingId: RequestHandler = async (req, res, next) => {
    try {
        console.log(req.body)
        res.status(200).send()
    } catch {
        res.status(500).send()
    }
}
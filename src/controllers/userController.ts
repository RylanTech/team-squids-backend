import { RequestHandler } from "express";
import { user } from "../models/users";

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        let newUser: user = req.body
        if (newUser.phoneId && newUser.favArr) {

            newUser.favArr = JSON.stringify(newUser.favArr)
            // console.log(newUser)
            let sameUser = await user.findOne({
                where: {phoneId: newUser.phoneId}
            })
            if (sameUser) {
                console.log("User already exists")
                res.status(200).send()
            } else {
                let created = await user.create(newUser)
                res.status(201).send(created)
            }

            res.status(201).send()
        } else {
            res.status(400).send()
        }
    } catch (err) {
        res.status(500).send(err)
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
            res.status(202).send()
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
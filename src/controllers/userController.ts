import { RequestHandler } from "express";
import { user } from "../models/users";

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        let newUser: user = req.body
        if (newUser.phoneId && newUser.favArr) {
            
            newUser.favArr = JSON.stringify(newUser.favArr)
            console.log(newUser)
            let created = await user.create(newUser)
            
            res.status(201).send(created)
        } else {
            res.status(400).send()
        }
    } catch (err) {
        res.status(500).send(err)
    }
};
import { RequestHandler } from "express";
import { request } from "http";
import { verifyUser } from "../services/authService";
import { Event } from "../models/event";
import { Church } from "../models/church";
import { ChurchUser } from "../models/churchUser";

export const getAllEvents: RequestHandler = async (req, res, next) => {
    //Basic return of all events
    let EventsInDB: Event[] = await Event.findAll();
    res.json(EventsInDB)
}

export const getEvent: RequestHandler = async (req, res, next) => {
    let eventId = req.params.eventId
    let foundEvent = await Event.findByPk(eventId, {
        include: [
            {
              model: Church,
              include: [
                {
                  model: ChurchUser
                }
              ]
            }
          ]
    })

    //Finding if the requested event object exists, then sending it
    if (foundEvent) {
        res.status(200).json(foundEvent);
    } else {
        res.status(404).json();
    }
}

export const getTenEvents: RequestHandler = async (req, res, next) => {
    //searching for events and returning 10

    //Getting this allows us to search
    const { Op } = require('sequelize');

    //converts the query to string so we can use it to search
    let query = req.params.query.toString()

    //Searching all event objects with matching parameters
    let foundEvents = await Event.findAll({
        limit: 10,
        offset: 0,
        //This is the part where it is comparing \/
        where: {
            [Op.or]: [
                { eventTitle: { [Op.like]: `%${query}%` } },
                { eventAddress: { [Op.like]: `%${query}%` } },
                { org: { [Op.like]: `%${query}%` } }
            ]
        }
    })
    if (foundEvents) {
        res.status(200).json(foundEvents);
    } else {
        res.status(404).json();
    }
}

export const createEvent: RequestHandler = async (req, res, next) => {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
        return res.status(403).send();
    }

    // if (verified) {
        //If thie user is verified and if the event has every required parameter, it will create a new event
        let newEvent: Event = req.body;
        if (
            newEvent.churchId,
            newEvent.eventTitle,
            newEvent.eventDate,
            newEvent.eventStreet,
            newEvent.eventCity,
            newEvent.eventState,
            newEvent.eventZip,
            newEvent.eventType,
            newEvent.description
        ) {
            let created = await Event.create(newEvent);
            res.status(200).json(created);
        
        } 
        else {
            res.status(400).send();
        }
}

export const updateEvent: RequestHandler = async (req, res, next) => {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
        return res.status(403).send();
    }
    // let verified = await verifyUser(req);
    //if (verified) {
    let eventId = req.params.eventId;
    let editedEvent: Event = req.body;

    //This grabs the id from the params and makes it so it can be read in the if statement incase the request does not include the id.
    let eventIdNum = parseInt(eventId);

    let matchingEvent = await Event.findByPk(eventId)

    //If the event that was requested has all of these attributes, edit the event
    if (matchingEvent && matchingEvent.eventId ==
        eventIdNum && editedEvent.eventTitle && editedEvent.churchId && editedEvent.eventStreet && editedEvent.description && editedEvent.eventDate &&
        editedEvent.eventType && editedEvent.eventCity && editedEvent.eventState && editedEvent.eventZip) {
        await Event.update(editedEvent, { where: {eventId: eventIdNum} })
        res.status(200).json();
    } else {
        res.status(400).json()
    }
    // } else{
    // res.status(400).json()
    //}
}

export const deleteEvent: RequestHandler = async (req, res, next) => {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
        return res.status(403).send();
    }
    
        let eventId = req.params.eventId;
        let foundEvent = await Event.findByPk(eventId);

        //if the user is verified and the event is found, delete it
        if (foundEvent) {
            await Event.destroy({
                where: { eventId: eventId }
            });
            res.status(200).json();
        } else {
            res.status(404).json();
        }
  }
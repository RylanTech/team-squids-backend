import { RequestHandler } from "express";
import { verifyUser } from "../services/authService";
import { Event } from "../models/event";
import { Church } from "../models/church";
import { ChurchUser } from "../models/churchUser";
import multer from "multer";
import { Op } from "sequelize";
import { createTrigger } from "../services/triggers";
import { Trigger } from "../models/triggers";

const path = require('path')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

interface TriggerInfo {
  body: string;
  title: string;
  dayBefore: boolean;
  weekBefore: boolean;
}

export const createEvent: RequestHandler = async (req, res, next) => {

  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }
    let newEvent: any

    let triggerInfo: TriggerInfo = {
      dayBefore: true,
      weekBefore: true,
      title: "Church Hive",
      body: "An event is coming up!",
    }


    const requestBodyVersion: string | string[] | undefined = req.headers['request-body-version'];

    if (requestBodyVersion === 'v4') {
      console.log('v4')
      triggerInfo = req.body.triggerInfo
      newEvent = req.body.newEvent
    } else if (requestBodyVersion === 'v3') {
      console.log('v3')
      triggerInfo = req.body.triggerInfo
      newEvent = req.body.newEvent
      newEvent.eventAudience = "Everyone"
    } else if (requestBodyVersion === 'v2') {
      console.log('v2')
      triggerInfo = req.body.triggerInfo
      triggerInfo.weekBefore = true
      triggerInfo.dayBefore = true
      newEvent = req.body.newEvent
      newEvent.eventAudience = "Everyone"
    } else {
      //old version
      console.log('v1')
      newEvent = req.body;
      newEvent.eventAudience = "Everyone"
    }
    console.log(newEvent.eventAudience)

    console.log(newEvent)

    const church: Church | null = await Church.findByPk(newEvent.churchId);

    if (!church) {
      return res.status(400).json({ error: "Invalid church ID" });
    }

    if (church.userId !== user.userId) {
      return res.status(401).send("Not authorized");
    }

    if (typeof newEvent.location !== "string") {
      newEvent.location = JSON.stringify(newEvent.location);
    }

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Image upload failed.' });
      }

      // If there is a file uploaded, you can access its information using req.file
      if (req.file) {
        newEvent.imageUrl = `https://churchhive.net/Images/${req.file.filename}`
      }
      console.log(newEvent.eventAudience)

      if (
        newEvent.eventTitle &&
        newEvent.date &&
        newEvent.location &&
        newEvent.eventType &&
        newEvent.description &&
        newEvent.imageUrl &&
        newEvent.eventAudience
      ) {
        console.log(newEvent.endDate)
        let created = await Event.create(newEvent);

        if (created.eventId) {
          console.log(triggerInfo)
          if (triggerInfo && triggerInfo.dayBefore === true) {
            let newTrigger = {
              triggerId: 0, // Placeholder for auto-incremented triggerId
              eventId: created.eventId,
              churchId: created.churchId,
              date: created.date.setDate(created.date.getDate() - 1),
              title: `${church.churchName}`,
              body: `"${created.eventTitle}" is tomorrow!`
            }
            createTrigger(newTrigger)
          } else if (triggerInfo && triggerInfo.dayBefore === false) {

          } else {
            let newTrigger = {
              triggerId: 0, // Placeholder for auto-incremented triggerId
              eventId: created.eventId,
              churchId: created.churchId,
              date: created.date.setDate(created.date.getDate() - 1),
              title: `${church.churchName}`,
              body: `"${created.eventTitle}" is tomorrow!`
            }
            createTrigger(newTrigger)
          }
          if (triggerInfo && triggerInfo.weekBefore === true) {
            let newTrigger = {
              triggerId: 0, // Placeholder for auto-incremented triggerId
              eventId: created.eventId,
              churchId: created.churchId,
              date: created.date.setDate(created.date.getDate() - 7),
              title: `${church.churchName}`,
              body: `"${created.eventTitle}" is next week!`
            }
            createTrigger(newTrigger)
          } else if (triggerInfo && triggerInfo.weekBefore === false) {

          } else {
            let newTrigger = {
              triggerId: 0, // Placeholder for auto-incremented triggerId
              eventId: created.eventId,
              churchId: created.churchId,
              date: created.date.setDate(created.date.getDate() - 7),
              title: `${church.churchName}`,
              body: `"${created.eventTitle}" is next week!`
            }
            createTrigger(newTrigger)
          }
          res.status(201).json(created);
        } else {
          res.status(500).send()
        }
      } else {
        res.status(400).send();
      }
    });
  } catch (error: any) {
    res.status(500).send(error)
  }
};

export const getAllEvents: RequestHandler = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 2);

    let events = await Event.findAll({
      where: {
        date: {
          [Op.lte]: prevDay, // Filter events with date equal to the day after the current day
        },
      },
      limit: 20,
    });

    if (events) {
      events.map(async (event) => {
        await Trigger.destroy({
          where: {
            eventId: event.eventId
          }
        });
        await Event.destroy({
          where: { eventId: event.eventId }
        })
      })
    }

    let updatedEvents = await Event.findAll({
      include: [
        {
          model: Church,
          include: [ChurchUser],
        },
      ],
      order: [
        ['date', 'ASC']
      ],
      limit: 20
    });


    updatedEvents.sort((a: any, b: any) => {
      const dateA = new Date(a.dataValues.date);
      const dateB = new Date(b.dataValues.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Parse location string for each church
    updatedEvents = updatedEvents.map((event) => {
      if (typeof event.location === "string") {
        event.location = JSON.parse(event.location);
      }
      return event;
    });

    res.json(updatedEvents);
  } catch (error: any) {
    res
      .status(500)
      .send(error.message || "Some error occurred while retrieving events.");
  }
};

export const getEvent: RequestHandler = async (req, res, next) => {
  try {

    const eventId = req.params.eventId;

    const currentDate = new Date();
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 2);

    let event = await Event.findByPk(eventId, {
      include: [
        {
          model: Church,
          include: [ChurchUser],
          required: false, // Make this relation optional
        },
      ],
    });

    if (!event) {
      return res.status(404).send("Error: Event not found");
    }

    if (event.date < prevDay) {
      await Trigger.destroy({
        where: {
          eventId: event.eventId
        }
      });
      await Event.destroy({
        where: { eventId: event.eventId }
      })
      return res.status(404).send("Event deleted")
    }

    if (typeof event.location === "string") {
      event.location = JSON.parse(event.location);
    }

    res.status(200).json(event);
  } catch (error: any) {
    res
      .status(500)
      .send(error.message || "Some error occurred while retrieving the Event.");
  }
};

export const getUserEvents: RequestHandler = async (req, res, next) => {

  const currentDate = new Date();
  const prevDay = new Date(currentDate);
  prevDay.setDate(currentDate.getDate() - 2);

  let userId = req.params.userId;
  let events = await Event.findAll({
    include: [
      {
        model: Church,
        include: [ChurchUser],
        required: true, // Make this relation optional
        where: {
          userId: userId
        }
      },
    ],
  });

  events.map(async (event) => {
    if (event.date < prevDay) {
      await Trigger.destroy({
        where: {
          eventId: event.eventId
        }
      });
      await Event.destroy({
        where: { eventId: event.eventId }
      })
    }
  })

  // If location is a string, parse it
  events = events.map((event) => {
    if (typeof event.location === "string") {
      event.location = JSON.parse(event.location);
    }
    return event;
  });

  events.sort((a: any, b: any) => {
    const dateA = new Date(a.dataValues.date);
    const dateB = new Date(b.dataValues.date);
    return dateA.getTime() - dateB.getTime();
  });


  res.status(200).json(events);
}

export const getTenEvents: RequestHandler = async (req, res, next) => {
  try {
    let events: Event[] = await Event.findAll({
      limit: 15,
      offset: 0,
      include: [
        {
          model: Church,
          include: [ChurchUser],
        },
      ],
    });

    events.sort((a: any, b: any) => {
      const dateA = new Date(a.dataValues.date);
      const dateB = new Date(b.dataValues.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Parse location string for each church
    events = events.map((event) => {
      if (typeof event.location === "string") {
        event.location = JSON.parse(event.location);
      }
      return event;
    });

    res.json(events);
  } catch (error: any) {
    res
      .status(500)
      .send(error.message || "Some error occurred while retrieving events.");
  }
};

export const updateEvent: RequestHandler = async (req, res, next) => {
  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }

    let eventId = req.params.eventId;
    let editEventData: Event = req.body;

    console.log(editEventData)

    // If location is an object, stringify it
    if (typeof editEventData.location !== "string") {
      editEventData.location = JSON.stringify(editEventData.location);
    }

    let matchingEvent = await Event.findByPk(eventId);
    if (!matchingEvent) {
      return res.status(401).send("Not the same church")
    } else {
      // Make sure the same user who created it is editing
      let churchId = req.body.churchId;
      if (!churchId || matchingEvent.churchId !== churchId) {
        if (user.userType !== "admin") {
          return res.status(401).send("Not the same user");
        }
      }
    }

    if (
      editEventData &&
      editEventData.eventTitle &&
      editEventData.date &&
      editEventData.eventType &&
      editEventData.description &&
      editEventData.imageUrl &&
      editEventData.location
    ) {
      let updated = await Event.update(editEventData, { where: { eventId: eventId } });

      if (updated) {
        let weekBeforeTrigger = await Trigger.findOne({
          where: {
            eventId: eventId,
            body: { [Op.like]: `%"${matchingEvent.eventTitle}" is next week!%` }
          },
        });

        let dayBeforeTrigger = await Trigger.findOne({
          where: {
            eventId: eventId,
            body: { [Op.like]: `%"${matchingEvent.eventTitle}" is tomorrow!%` }
          },
        });


        console.log("UpdatingTriggersHere")
        console.log(weekBeforeTrigger)
        console.log(`${matchingEvent.eventTitle} is next week!`)

        if (weekBeforeTrigger) {
          let newTriggerWeekDate = new Date(editEventData.date);
          newTriggerWeekDate.setDate(newTriggerWeekDate.getDate() - 7.1);

          // Update the week before trigger with the current event info
          await Trigger.update(
            {
              eventId: matchingEvent.eventId,
              churchId: matchingEvent.churchId,
              date: newTriggerWeekDate,
              title: `${weekBeforeTrigger.title}`,
              body: `"${editEventData.eventTitle}" is next week!`
            },
            { where: { triggerId: weekBeforeTrigger.triggerId } }
          );
        }

        if (dayBeforeTrigger) {
          let newTriggerDayDate = new Date(editEventData.date);
          newTriggerDayDate.setDate(newTriggerDayDate.getDate() - 1.1);

          await Trigger.update(
            {
              eventId: matchingEvent.eventId,
              churchId: matchingEvent.churchId,
              date: newTriggerDayDate,
              title: `${dayBeforeTrigger.title}`,
              body: `"${editEventData.eventTitle}" is tomorrow!`
            },
            { where: { triggerId: dayBeforeTrigger.triggerId } }
          );
        }
        return res.status(200).send("Event edited");
      } else {
        return res.status(400).send()
      }
    } else {
      return res.status(400).json();
    }
  } catch (error: any) {
    res
      .status(500)
      .send(error.message || "Some error occurred while editing the Event.");
  }
};

export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(401).send();
    }

    const eventId: number = parseInt(req.params.eventId);
    const event: Event | null = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const church: Church | null = await Church.findByPk(event.churchId);
    if (!church || church.userId !== user.userId) {
      if (user.userType !== "admin") {
        return res.status(401).send("Not the same user");
      }
    }

    // Delete all triggers associated with the event
    await Trigger.destroy({ where: { eventId: eventId } });

    // Delete the event itself
    await Event.destroy({ where: { eventId: eventId } });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
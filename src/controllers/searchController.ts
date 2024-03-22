import { Op, Sequelize } from "sequelize";
import { Church } from "../models/church";
import { RequestHandler } from "express";
import { Event } from "../models/event";
import { ChurchUser } from "../models/churchUser";
import { verifyUser } from "../services/authService";
import { Trigger } from "../models/triggers";

// Simiple search function 
export const searchChurch: RequestHandler = async (req, res, next) => {
  let usr = await verifyUser(req)
  // Convert the search query to lowercase
  let query = req.params.query.toLowerCase();
  // Minimum length of the search query
  const minimumQueryLength = 3;
  // Check if the query has fewer characters than the minimum length
  if (query.length > minimumQueryLength || usr?.userType === 'admin') {
    try {
      let resultsDB = await Church.findAll({
        where: {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('churchName')), 'LIKE', `%${query.toLowerCase()}%`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('location')), 'LIKE', `%${query.toLowerCase()}%`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('denomination')), 'LIKE', `%${query.toLowerCase()}%`),
          ]
        },
        limit: 15,
      });

      resultsDB = resultsDB.map((church) => {
        if (typeof church.location === "string") {
          church.location = JSON.parse(church.location);
        }
        return church;
      });

      res.status(200).json(resultsDB);
    } catch (err) {
      res.status(404).json({ error: 'Database search query failed' });
    }
  } else {
    return res.status(400).json({ error: 'Search query must have at least 3 characters' });
  }
};


export const searchEvent: RequestHandler = async (req, res, next) => {
  // Convert the search query to lowercase
  let query = req.params.query.toLowerCase();
  // Minimum length of the search query
  const minimumQueryLength = 3;
  // Check if the query has fewer characters than the minimum length
  if (query.length < minimumQueryLength) {
    return res.status(400).json({ error: 'Search query must have at least 3 characters' });
  }
  try {
    const currentDate = new Date();
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 2);

    let checkResultsDB = await Event.findAll({
      include: [{
        model: Church
      }],
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Event.location')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('eventType')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('churchName')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('eventTitle')), 'LIKE', `%${query.toLowerCase()}%`),
          //  Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('date')), 'LIKE', `%${query.toLowerCase()}%`),
        ],
        date: {
          [Op.lte]: prevDay, // Filter events with date equal to the day after the current day
        },
      },
      limit: 15,
    });

    if (checkResultsDB) {
      checkResultsDB.map((event: Event) => {
        Trigger.destroy({
          where: { eventId: event.eventId}
        })
        Event.destroy({
          where: { eventId: event.eventId }
        })
      })
    }

    let resultsDB = await Event.findAll({
      include: [{
        model: Church
      }],
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Event.location')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('eventType')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('churchName')), 'LIKE', `%${query.toLowerCase()}%`),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('eventTitle')), 'LIKE', `%${query.toLowerCase()}%`),
          //  Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('date')), 'LIKE', `%${query.toLowerCase()}%`),

        ]
      },
      limit: 15.
    });

    resultsDB = resultsDB.map((event) => {
      if (typeof event.location === "string") {
        event.location = JSON.parse(event.location);
      }
      return event;
    });

    res.status(200).json(resultsDB);
  } catch (err) {
    res.status(500).json(err);
  }
};


export const searchUser: RequestHandler = async (req, res, next) => {
  let usr = await verifyUser(req)
  // Convert the search query to lowercase
  let query = req.params.query.toLowerCase();
  // Minimum length of the search query
  const minimumQueryLength = 3;
  // Check if the query has fewer characters than the minimum length
  if (query.length > minimumQueryLength || usr?.userType === 'admin') {
    if (query === "getallusers") {
      let user: ChurchUser | null = await verifyUser(req);
      if (!user) {
        return res.status(401).send("Must be logged in to make this call");
      } else {
        try {
          let resultsDB = await ChurchUser.findAll()
          res.status(200).send(resultsDB)
        } catch {
          res.status(500).json({ error: 'error getting all users' })
        }
      }
    } else {
      try {
        let resultsDB = await ChurchUser.findAll({
          where: {
            [Op.or]: [
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('userId')), 'LIKE', `%${query.toLowerCase()}%`),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('firstName')), 'LIKE', `%${query.toLowerCase()}%`),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('lastName')), 'LIKE', `%${query.toLowerCase()}%`),
              Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), 'LIKE', `%${query.toLowerCase()}%`),
            ]
          },
          limit: 15,
        });

        res.status(200).json(resultsDB);
      } catch (err) {
        res.status(404).json({ error: 'Database search query failed' });
      }
    }
  } else {
    return res.status(400).json({ error: 'Search query must have at least 3 characters' });
  }
};
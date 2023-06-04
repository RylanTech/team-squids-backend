import { RequestHandler } from "express";
import { Church } from "../models/church";
import { Event } from "../models/event";
import { Op } from "sequelize";
import { ChurchUser } from "../models/churchUser";
import { verifyUser } from "../services/authService";

export const createChurch: RequestHandler = async (req, res, next) => {
  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }

    let newChurch: Church = req.body;

    if (typeof newChurch.location !== "string") {
      newChurch.location = JSON.stringify(newChurch.location);
    }

    if (
      newChurch.churchName &&
      newChurch.denomination &&
      newChurch.location &&
      newChurch.phoneNumber &&
      newChurch.churchEmail &&
      newChurch.welcomeMessage &&
      newChurch.serviceTime &&
      newChurch.imageUrl &&
      newChurch.website
    ) {
      let created = await Church.create(newChurch);

      // If location is a string, parse it
      if (typeof created.location === "string") {
        created.location = JSON.parse(created.location);
      }

      res.status(201).json(created);
    } else {
      res.status(400).send();
    }
  } catch (error: any) {
    res.status(500).send(error.message || "Some error occurred while creating the Church.");
  }
};

export const getChurch: RequestHandler = async (req, res, next) => {
  try {
    let churchFound: Church[] = await Church.findAll({
      include: [
        {
          model: ChurchUser,
        },
      ],
    });

    // Parse location string for each church
    churchFound = churchFound.map((church) => {
      if (typeof church.location === "string") {
        church.location = JSON.parse(church.location);
      }
      return church;
    });

    res.json(churchFound);
  } catch (error: any) {
    res.status(500).send(error.message || "Some error occurred while retrieving churches.");
  }
};

export const getOneChurch: RequestHandler = async (req, res, next) => {
  try {
    const churchId = req.params.id;
    let church = await Church.findByPk(churchId, {
      include: [
        {
          model: ChurchUser,
        },
        {
          model: Event,
          where: {
            date: {
              [Op.gte]: Date.now(),
            },
          },
          required: false, // Make this relation optional
          include: [
            {
              model: Church,
              include: [ChurchUser],
            },
          ],
        },
      ],
    });

    if (!church) {
      return res.status(404).send("Error: Church not found");
    }

    if (typeof church.location === "string") {
      church.location = JSON.parse(church.location);
    }

    res.status(200).json(church);
  } catch (error: any) {
    res
      .status(500)
      .send(error.message || "Some error occurred while retrieving the Church.");
  }
};
export const getUserChurch: RequestHandler = async (req, res, next) => {
    
  let userId = req.params.userId;
  let church = await Church.findAll( {
    include: [
      {
        model: ChurchUser,
        required: true,
        where: { userId:userId}
      }
    ],
  });
  // If location is a string, parse it
  church = church.map((church) => {
    if (typeof church.location === "string") {
      church.location = JSON.parse(church.location);
    }
    return church;
  });
 
 
  
  res.status(200).json(church);
} 

export const editChurch: RequestHandler = async (req, res, next) => {
  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }

    let churchId = req.params.id;
    let editChurchData: Church = req.body;

    // If location is an object, stringify it
    if (typeof editChurchData.location !== "string") {
      editChurchData.location = JSON.stringify(editChurchData.location);
    }

    let matchingChurch = await Church.findByPk(churchId);

    // Make sure the same user who created it is editing
    let userId = req.body.userId;
    let userFound = await ChurchUser.findByPk(userId);
    if (!userFound || userFound.userId !== user.userId) {
      return res.status(403).send("Not the same user");
    }

    if (
      matchingChurch &&
      matchingChurch.userId &&
      matchingChurch.churchName &&
      matchingChurch.denomination &&
      matchingChurch.location &&
      matchingChurch.phoneNumber &&
      matchingChurch.churchEmail &&
      matchingChurch.welcomeMessage &&
      matchingChurch.serviceTime &&
      matchingChurch.imageUrl &&
      matchingChurch.website &&
      matchingChurch.userId === editChurchData.userId
    ) {
      await Church.update(editChurchData, { where: { churchId: churchId } });
      return res.status(200).send("Church edited");
    } else {
      return res.status(400).json();
    }
  } catch (error: any) {
    res.status(500).send(error.message || "Some error occurred while editing the Church.");
  }
};

export const deleteChurch: RequestHandler = async (req, res, next) => {
  try {
    let user: ChurchUser | null = await verifyUser(req);
    if (!user) {
      return res.status(403).send();
    }

    let churchId = req.params.id;
    let churchFound = await Church.findByPk(churchId);

    // Make sure same user who created it can delete
    let userId = req.body.userId;
    let userFound = await ChurchUser.findByPk(churchFound?.userId);
    if (!userFound || userFound.dataValues.userId !== user.userId) {
      return res.status(403).send("Not the same user");
    }

    if (churchFound) {
      await Church.destroy({
        where: { churchId: churchId },
      });
      res.status(200).json();
    } else {
      res.status(404).json();
    }
  } catch (error: any) {
    res.status(500).send(error.message || "Some error occurred while deleting the Church.");
  }
};
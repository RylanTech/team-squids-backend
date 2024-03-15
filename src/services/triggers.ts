import { Op, Sequelize } from "sequelize";
import { Trigger } from "../models/triggers";
import { user } from "../models/users";
import 'dotenv/config'
import { getAccessToken } from "./googleapi";
import axios from "axios";

export async function fireNoti() {
    try {
        async function findAllUsersWithFavoriteChurch(churchId: number): Promise<string[]> {
            let notiUsers = await user.findAll({
                attributes: ['phoneId'], // Select only the 'phoneId' column
                where: {
                    [Op.or]: [
                        Sequelize.where(Sequelize.col('favArr'), 'LIKE', `%,[${churchId},%`),
                        Sequelize.where(Sequelize.col('favArr'), 'LIKE', `%,${churchId},%`),
                        Sequelize.where(Sequelize.col('favArr'), 'LIKE', `%,${churchId}]%`),
                        Sequelize.where(Sequelize.col('favArr'), 'LIKE', `%[${churchId}]%`),
                    ]
                },
            });

            // Extract phoneId values from the result
            const phoneIds: string[] = notiUsers.map((user) => user.phoneId);

            return phoneIds;
        }

        // Get the current date in local time
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //queries in UTC time (That's how times are stored)
        const startOfDayToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));

        // Set the end time to 12:59 PM UTC
        const endOfDayToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

        console.log(startOfDayToday)
        console.log(endOfDayToday)

        // Query triggers where the date is tomorrow
        const triggers = await Trigger.findAll({
            where: {
                date: {
                    [Op.lt]: endOfDayToday,
                },
            },
        });
        console.log("Triggerd")
        console.log(triggers)
        if (triggers.length) {
            triggers.map(async (tri) => {
                let phoneIds = await findAllUsersWithFavoriteChurch(tri.churchId)
                console.log(`Notificaitons will be sent to the following phoneId's\n${phoneIds}`)
                sendNotifications(phoneIds, tri.title, tri.body)
                Trigger.destroy({ where: { triggerId: tri.triggerId } })
            })
        } else {
            console.log("No triggers")
        }


        //handle triggers in the past if any exist
        const pastTriggers = await Trigger.findAll({
            where: {
                date: {
                    [Op.lt]: startOfDayToday,
                },
            },
        });
        pastTriggers.map((tri) => {
            Trigger.destroy({ where: { triggerId: tri.triggerId } })
        })
    } catch (error) {
        console.error("Error finding triggers:", error);
        throw error;
    }
}

export function createTrigger(newTrigger: any) {
    Trigger.create(newTrigger)
}

export async function sendNotifications(phoneIds: any, title: string, body: string) {
    let access_token = await getAccessToken();
    const authHeader = async () => ({
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
    });
    let headerInfo = await authHeader(); // Use await here

    let endpoint = process.env.GOOGLE_NOTI_ENDPOINT ?? '';

    phoneIds.map(async (phoneId: string) => {
        if (endpoint != '') {
            let googleRequestBody = {
                "message": {
                    "token": phoneId,
                    "notification": {
                        "title": title,
                        "body": body
                    }
                }
            }

            console.log(googleRequestBody)

            let responce: any = await axios.post(endpoint, googleRequestBody, {
                headers: headerInfo
            })
                .then(async (responce: any) => {
                    console.log(responce)
                })
                .catch(async (error: any) => {
                    if (error.response.status === 404) {
                        await user.destroy({
                            where: {
                                phoneId: googleRequestBody.message.token
                            }
                        });
                        console.log("oldId Destroyed")
                    }
                });
        }

    })
}
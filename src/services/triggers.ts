import { Op, Sequelize } from "sequelize";
import { Trigger } from "../models/triggers";
import { user } from "../models/users";

export function scheduleTask(targetTime: string, callback: any, cooldownTime: number) {
    const [targetHour, targetMinute] = targetTime.split(':').map(Number);
    let lastExecutionTime = 0;

    function checkTime() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const targetTimeInMinutes = targetHour * 60 + targetMinute;

        // Check if it's the target time and cooldown has passed
        if (
            currentTimeInMinutes === targetTimeInMinutes &&
            currentTimeInMinutes - lastExecutionTime >= cooldownTime
        ) {
            // Execute the callback function
            callback();

            // Update the last execution time
            lastExecutionTime = currentTimeInMinutes;
        }
    }

    // Run the check every second (adjust the interval as needed)
    setInterval(checkTime, 5000);
}

export async function onTimeReached() {
    try {
        async function findAllUsersWithFavoriteChurch(churchId: number): Promise<string[]> {
            let notiUsers = await user.findAll({
                attributes: ['phoneId'], // Select only the 'phoneId' column
                where: {
                    [Op.or]: [
                        Sequelize.where(Sequelize.col('favArr'), 'LIKE', `%${churchId},%`),
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
        const endOfDayToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 59, 59, 999));

        console.log(startOfDayToday)
        console.log(endOfDayToday)

        // Query triggers where the date is tomorrow
        const triggers = await Trigger.findAll({
            where: {
                date: {
                    [Op.between]: [startOfDayToday, endOfDayToday],
                },
            },
        });
        console.log("Triggers")
        console.log(triggers)
        triggers.map(async (tri) => {
            let users = await findAllUsersWithFavoriteChurch(tri.churchId)
            console.log(`Notificaitons will be sent to the following phoneId's\n${users}`)
            console.log(`${tri.title} \n ${tri.body}`)
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

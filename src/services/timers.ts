// export function scheduleTaskEveryDay(targetTime: string, callback: any, cooldownTime: number) {
//     const [targetHour, targetMinute] = targetTime.split(':').map(Number);
//     let lastExecutionTime = 0;

import { fireNoti } from "./triggers";

//     function checkTime() {
//         const now = new Date();
//         const currentHour = now.getHours();
//         const currentMinute = now.getMinutes();

//         const currentTimeInMinutes = currentHour * 60 + currentMinute;
//         const targetTimeInMinutes = targetHour * 60 + targetMinute;

//         // Check if it's the target time and cooldown has passed
//         if (
//             currentTimeInMinutes === targetTimeInMinutes &&
//             currentTimeInMinutes - lastExecutionTime >= cooldownTime
//         ) {
//             // Execute the callback function
//             callback();

//             // Update the last execution time
//             lastExecutionTime = currentTimeInMinutes;
//         }
//     }

//     // Run the check every second (adjust the interval as needed)
//     setInterval(checkTime, 5000);
// }
// Function to check if it's time to execute the callback

async function dailyCallback() {
  try {
      await fireNoti();
  } catch (error) {
      console.error("Error in dailyCallback:", error);
      throw error;
  }
}

export function checkTimeAndExecute() {
  var now = new Date();
  console.log(now.getHours())
  if (now.getHours() === 13 && now.getMinutes() === 25 && now.getSeconds() === 0) {
      dailyCallback();
  }
}

// Set interval to check the time every second
setInterval(checkTimeAndExecute, 1000);
export function scheduleTaskEveryDay(targetTime: string, callback: any, cooldownTime: number) {
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

export function scheduleTaskEveryNDays(callback: () => void, cooldownDays: number) {
    let lastExecutionDate = new Date(0);
  
    function checkTime() {
      const now = new Date();
      const currentTime = now.getTime();
      const lastExecutionTime = lastExecutionDate.getTime();
  
      // Calculate the difference in days
      const daysSinceLastExecution = Math.floor((currentTime - lastExecutionTime) / (24 * 60 * 60 * 1000));
  
      // Check if cooldown days have passed
      if (daysSinceLastExecution >= cooldownDays) {
        // Execute the callback function
        callback();
  
        // Update the last execution date
        lastExecutionDate = now;
      }
    }
  
    // Run the check every day (adjust the interval as needed)
    setInterval(checkTime, 24 * 60 * 60 * 1000);
  }
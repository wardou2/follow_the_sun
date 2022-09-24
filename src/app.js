require("dotenv").config();
const SunCalc = require("suncalc");
const schedule = require("node-schedule");

const Hue = require("./hue");
const { newLog } = require("./logger");

/**
 * Basics:
 *  * A scheduler is set to run at midnight each night. The callback fetches sunrise/sunset times,
 *    and creates an additional schedule for those times. It's these callbacks that change lights.
 *
 * TODO:
 *  * Make the routines attributes of the Hue class.
 *  * Use GroupState to set scene: https://github.com/peter-murray/node-hue-api/blob/typescript/docs/groups.md#activating-a-scene
 *  * Make routines use the 'groups' API, rather than write to each bulb individually.
 *  * Make nightly scheduler work
 *
 * NICE TO HAVE:
 *  * A propper logger would help with debugging.
 */
const main = async () => {
  const hue = await Hue.build();

  const getSunTimes = () => {
    // Hardcoded for Seattle, for now
    const { sunrise, sunset } = SunCalc.getTimes(new Date(), 47, -122);

    const sunriseStart = new Date(sunrise);
    sunriseStart.setHours(sunrise.getHours() - 1);

    const sunsetStart = new Date(sunset);
    sunsetStart.setHours(sunset.getHours() - 1);

    return [sunriseStart, sunsetStart];
  };

  const initialize = async () => {
    newLog("initialize");

    fetchSunTimes();
    scheduleFetch();
  };

  /** For Testing Only. Run the sunset routine now. */
  const runNow = () => {
    newLog("run now");
    sunsetRoutine();
  };

  const sunsetRoutine = async () => {
    newLog("sunset routine");

    const transitiontimes = hue.getTransitionTimes();
    // Get all lights that are on
    const lights = (await hue.getLights()).filter((light) => light.state.on);
    lights.forEach((light) => {
      if (light.state.ct) {
        hue.setLightState(light.id, {
          ct: 500,
          transitiontime: transitiontimes.ten,
        });
      } else {
        hue.setLightState(light.id, {
          hue: 11342,
          sat: 183,
          transitiontime: transitiontimes.ten,
        });
      }
    });
  };

  /** Function to be called when fetching sunrise/sunset times. Schedules sunset routine. */
  const fetchSunTimes = () => {
    const [_sunrise, sunset] = getSunTimes();
    scheduleSunsetRoutine(sunset);
    newLog(`Fetch Sun Times. Scheduled Sunset for ${sunset}`);
  };

  /** Set schedule to check for sunset times every day at midnight */
  const scheduleFetch = () => schedule.scheduleJob("0 0 * * *", fetchSunTimes);

  const scheduleSunsetRoutine = (time) =>
    schedule.scheduleJob(time, sunsetRoutine);

  initialize();
  // runNow();
};

main();

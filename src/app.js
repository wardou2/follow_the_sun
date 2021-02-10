require('dotenv').config();
const SunCalc = require('suncalc')
const schedule = require('node-schedule');

const Hue = require('./hue')

const main = async () => { 
    const hueAPI = await Hue.build()

    const getSunTimes = () => {
        // Hardcoded for Seattle, for now
        const times = SunCalc.getTimes(new Date(), 47, -122);
        const sunrise = times.sunrise
        const sunset = times.sunset // .getHours() + ':' + times.sunrise.getMinutes();
        return [sunrise, sunset]
    }

    const initialize = async () => {
        
        const [sunrise, sunset] = getSunTimes()

        // Set schedule to check for sunset times every day at midnight
        schedule.scheduleJob('0 0 * * *', () => {
            sunset = getSunTimes()
        })
        return [sunrise, sunset]
    }

    const checkIfSunset = () =>  {
        let now = new Date()
        if (sunset > now) console.log(true)
    }

    let [sunrise, sunset] = await initialize()
    hueAPI.changeLight(3)
    

}

main()
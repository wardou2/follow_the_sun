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

        const sunriseStart = new Date(sunrise)
        sunriseStart.setMinutes(sunrise.getMinutes() - 30)
        const sunsetStart = new Date(sunset)
        sunsetStart.setMinutes(sunset.getMinutes() - 30)

        return [sunriseStart, sunsetStart]
    }

    const initialize = async () => {
        
        const [sunrise, sunset] = getSunTimes()

        // Set schedule to check for sunset times every day at midnight
        schedule.scheduleJob('0 0 * * *', () => {
            [sunrise, sunset] = getSunTimes()
            console.log('ran schedule now', new Date())
        })
        return [sunrise, sunset]
    }
    
    const sunsetRoutine = async () => {
        // Get all lights that are on
        const lights = (await hueAPI.getLights()).filter(light => 
            light.state.on
        )
        lights.forEach(light => {
            if (light.state.ct) {
                hueAPI.setLightState(light.id, {ct: 500, transitiontime: 36000})
            } else {
                hueAPI.setLightState(light.id, {hue: 11342, sat: 183, transitiontime: 36000})
            }
            
        })
    }

    let [sunriseStart, sunsetStart] = await initialize()

    // For testing purposes
    const now = new Date()
    now.setMilliseconds(now.getMilliseconds() + 2000 )

    const job = schedule.scheduleJob(sunsetSTart, () => {
        console.log('ran sunset routine now')
        sunsetRoutine()
    })
}

main()
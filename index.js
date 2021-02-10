require('dotenv').config();
const v3 = require('node-hue-api').v3
    , hueApi = v3.api
    , Rule = v3.rules.Rule
    , LightState = v3.lightStates.LightState;
const SunCalc = require('suncalc')
const schedule = require('node-schedule');

const main = async () => { 
    let IP_ADDRESS 
    let USERNAME 
    let api 

    const getBridgeIp = async () => {
        const results = await v3.discovery.nupnpSearch()
        if (results.length !== 0) {
            return results[0].ipaddress
        }
    }

    const getApi = async () => {
        const api = await hueApi.createLocal(IP_ADDRESS).connect(USERNAME)
        return api
    }

    const getSunTimes = () => {
        // Hardcoded for Seattle, for now
        const times = SunCalc.getTimes(new Date(), 47, -122);
        const sunrise = times.sunrise
        const sunset = times.sunset // .getHours() + ':' + times.sunrise.getMinutes();
        return [sunrise, sunset]
    }

    const initialize = async () => {
        IP_ADDRESS = await getBridgeIp()
        USERNAME = process.env.USERNAME
        api = await getApi()

        const [sunrise, sunset] = getSunTimes()

        // Set schedule to check for sunset times every day at midnight
        schedule.scheduleJob('0 0 * * *', () => {
            sunset = getSunTimes()
        })
        return [sunrise, sunset]
    }

    const getLights = async () => {
        const results = await api.lights.getAll()
        const lights = results.map(light => {
            return light["_data"]
        })
        return lights
    } 

    const changeLight = (lightId) => {
        const lightState = new LightState()
            .on()
            .ct(200)
            .brightness(100)
    
        return api.lights.setLightState(lightId, lightState)
    }

    const checkIfSunset = () =>  {
        let now = new Date()
        if (sunset > now) console.log(true)
    }

    let [sunrise, sunset] = await initialize()
    console.log(sunrise)
    

}

main()
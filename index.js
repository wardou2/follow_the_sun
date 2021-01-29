require('dotenv').config();
const v3 = require('node-hue-api').v3
    , hueApi = v3.api
    , Rule = v3.rules.Rule
    , LightState = v3.lightStates.LightState;
const SunCalc = require('suncalc')

const main = async () => { 
    let IP_ADDRESS 
    let USERNAME 
    let api 
    let sunset 

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

    const getSunset = () => {
        // Hardcoded for Seattle, for now
        const times = SunCalc.getTimes(new Date(), 47, -122);
        const sunset = times.sunset // .getHours() + ':' + times.sunrise.getMinutes();
        return sunset
    }

    const initTimer = () => {
        // https://stackoverflow.com/questions/4455282/call-a-javascript-function-at-a-specific-time-of-day
        let now = new Date();
        let millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0) - now;
        if (millisTillMidnight < 0) {
            millisTillMidnight += 86400000; // it's after 11:59pm, try 11:59pm tomorrow.
        }
        console.log(millisTillMidnight)
        return setInterval(function(){
            sunset = getSunset();
            console.log('h')
        }, millisTillMidnight);
    }

    const initialize = async () => {
        IP_ADDRESS = await getBridgeIp()
        USERNAME = process.env.USERNAME
        api = await getApi()
        sunset = getSunset()
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

    const checkIfSunset = () => setInterval(() => {
        let now = new Date()
        if (sunset > now) console.log(true)
    }, 1000)

    await initialize()
    const checkSunTimes = initTimer()
}

main()
require('dotenv').config();
const v3 = require('node-hue-api').v3
    , hueApi = v3.api
    , Rule = v3.rules.Rule
    , LightState = v3.lightStates.LightState;
const SunCalc = require('suncalc')

const main = async () => {    

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

    const IP_ADDRESS = await getBridgeIp()
    const USERNAME = process.env.USERNAME
    const api = await getApi()
    const sunset = getSunset()

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


    const checkSunsetId = checkIfSunset()

    setTimeout(() => {
        clearInterval(checkSunsetId)
    }, 10000)
    
}

main()
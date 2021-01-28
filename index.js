require('dotenv').config();
const v3 = require('node-hue-api').v3
    , hueApi = v3.api

const LightState = v3.lightStates.LightState;


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

    const IP_ADDRESS = await getBridgeIp()
    const USERNAME = process.env.USERNAME
    const api = await getApi()

    const getAllLights = async () => {
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

    const lights = await getAllLights()
    console.log(lights)
}

main()
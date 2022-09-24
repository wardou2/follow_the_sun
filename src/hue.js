const nodeHueApi = require("node-hue-api");
const hueApi = nodeHueApi.v3.api;
const discovery = nodeHueApi.discovery;
const LightState = nodeHueApi.v3.lightStates.LightState;

class Hue {
  constructor(ipAddress, api, username) {
    this.IP_ADDRESS = ipAddress;
    this.api = api;
    this.USERNAME = username;
    this.transitionTimes = {
      ten: 6000,
      thirty: 18000,
    };
  }

  static async build() {
    const username = process.env.USERNAME;
    const ipAddress = await this.getBridgeIp();
    const api = await this.getApi(ipAddress, username);
    return new Hue(ipAddress, api, username);
  }

  getTransitionTimes() {
    return this.transitionTimes;
  }

  static getBridgeIp = async () => {
    const results = await discovery.nupnpSearch();
    if (results.length !== 0) {
      return results[0].ipaddress;
    } else {
      throw new Error("No IP Address found");
    }
  };

  static getApi = async (ipAddress, username) => {
    const api = await hueApi.createLocal(ipAddress).connect(username);
    return api;
  };

  async getLights() {
    const results = await this.api.lights.getAll();
    const lights = results.map((light) => {
      return light.data;
    });
    return lights;
  }

  async setLightState(lightId, { hue, sat, ct, transitiontime }) {
    const lightState = ct
      ? new LightState().on().ct(ct).transitiontime(transitiontime)
      : new LightState().on().hue(hue).sat(sat).transitiontime(transitiontime);

    return this.api.lights.setLightState(lightId, lightState);
  }
}

module.exports = Hue;

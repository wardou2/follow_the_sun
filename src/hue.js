const v3 = require("node-hue-api").v3,
  hueApi = v3.api,
  Rule = v3.rules.Rule,
  LightState = v3.lightStates.LightState;

class Hue {
  constructor(ipAddress, api, username) {
    this.IP_ADDRESS = ipAddress;
    this.api = api;
    this.USERNAME = username;
  }

  static async build() {
    const username = process.env.USERNAME;
    const ipAddress = await this.getBridgeIp();
    const api = await this.getApi(ipAddress, username);
    return new Hue(ipAddress, api, username);
  }

  static getBridgeIp = async () => {
    const results = await v3.discovery.nupnpSearch();
    if (results.length !== 0) {
      return results[0].ipaddress;
    }
  };

  static getApi = async (ipAddress, username) => {
    const api = await hueApi.createLocal(ipAddress).connect(username);
    return api;
  };

  async getLights() {
    const results = await this.api.lights.getAll();
    const lights = results.map((light) => {
      return light["_data"];
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

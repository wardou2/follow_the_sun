const schedule = require("node-schedule");

class Controller {
  constructor() {}

  static scheduleJob(time, callback) {
    schedule.scheduleJob(time, callback);
  }
}

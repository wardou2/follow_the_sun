function newLog(message) {
  console.log(new Date().toString(), " - ", message);
}

module.exports = { newLog };

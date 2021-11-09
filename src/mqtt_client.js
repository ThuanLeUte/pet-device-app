const { IsDefined } = require("./utils.js");

module.exports = { connect_server, publish, subscribe };

const mqtt = require("mqtt");
let client;
function connect_server(args) {
  client = mqtt.connect(...args);
  client.on("connect", function () {
    console.log("connected  " + client.connected);
  });

  client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1);
  });
}

//publish topic
function publish(topic, msg, options) {
  console.log("publishing", msg);

  if (client.connected) {
    client.publish(topic, msg, options);
  }
}

//subcribe topic
function subscribe(topic, callback_func, options) {
  client.subscribe(topic, options);
  //handle incoming messages
  client.on("message", function (topic, message) {
    callback_func(topic, message);
  });
}

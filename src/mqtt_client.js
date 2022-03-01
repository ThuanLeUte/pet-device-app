module.exports = { connect_server, publish, subscribe, unsubscribe };

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
function subscribe(topic_name, callback_func, options) {
  client.subscribe(topic_name, options);
  //handle incoming messages
  client.on("message", callback_func);
}

//unsubcribe topic
function unsubscribe(topic, callback_func) {
  client.unsubscribe(topic);
  client.off("message", callback_func);
}

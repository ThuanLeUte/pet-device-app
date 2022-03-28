module.exports = {
  connect_server,
  publish,
  subscribe,
  unsubscribe,
  add_callback,
  remove_callback,
};

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
  console.log("topic", topic);
  if (client.connected) {
    client.publish(topic, msg, options);
  }
}

//subcribe topic
function subscribe(topic_name, options) {
  client.subscribe(topic_name, options);
  //handle incoming messages
}

function add_callback(callback_func) {
  client.on("message", callback_func);
}

function remove_callback(callback_func) {
  client.off("message", callback_func);
}

//unsubcribe topic
function unsubscribe(topic, callback_func) {
  client.unsubscribe(topic);
}

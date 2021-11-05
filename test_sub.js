const { connect_server, publish, subscribe } = require("./src/mqtt_client.js");

connect_server(["mqtt://test.mosquitto.org"]);
subscribe("testtopic", func, { qos: 1 });

function func(topic, message) {
  console.log("message is " + message);
  console.log("topic is " + topic);
}

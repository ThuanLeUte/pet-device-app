const { connect_server, publish, subscribe } = require("./src/mqtt_client.js");

var options = {
  retain: true,
  qos: 1,
};

connect_server(["mqtt://test.mosquitto.org"]);

var timer_id = setInterval(function () {
  publish("testtopic", "test message", options);
}, 1000);

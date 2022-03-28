const { connect_server, publish, subscribe } = require("./src/mqtt_client.js");

var options = {
  retain: true,
  qos: 1,
};

connect_server(["mqtt://test.mosquitto.org"]);

var timer_id = setInterval(function () {
  var obj = {
    type: "request",
    value: false,
  };
  var obj1 = {
    type: "req",
    data: {
      req: "del_nfc",
      nfc_id: "02C400450CB243",
    },
  };
  // publish("Device_3", "Alive", options);
  publish("Device_3/nfc_setting", JSON.stringify(obj), options);
}, 1000);

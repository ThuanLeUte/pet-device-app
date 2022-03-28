const {
  connect_server,
  publish,
  subscribe,
  unsubscribe,
  add_callback,
  remove_callback,
} = require("../src/mqtt_client.js");
const { ipcRenderer } = require("electron");
const { connect } = require("mqtt");
const ipc = ipcRenderer;
const fs = require("fs");

const darkmode = document.getElementById("darkmode_toggle");
const minimize_Btn = document.getElementById("minimize_Btn");
const maxRes_Btn = document.getElementById("maxRes_Btn");
const close_Btn = document.getElementById("close_Btn");
const connect_Btn = document.getElementById("btn_connect");
const find_nfc_Btn = document.getElementById("btn_find_nfc");
const connect_device_container = document.getElementById(
  "connect_device_container"
);
const connect_device = document.getElementById("connect_device_input");
const nfc_id_input = document.getElementById("nfc_id_input");
const pet_name_container = document.getElementById("pet_name_container");
const pet_name = document.getElementById("pet_name_input");
const species_container = document.getElementById("species_container");
const species = document.getElementById("species_input");
const devices_menu = document.getElementById("devices_menu");
const monitor_nfc_region = document.getElementById("monitor_nfc_region");
const info_nfc_region = document.getElementById("info_nfc_region");
const changelog_region = document.getElementById("changelog_region");
const clear_changelog = document.getElementById("clear_changelog");

//Global variables for js
let device_requested_del_nfc = "";
let selected_nfc;
let is_requested_del_nfc = false;
let IsInDropdown = false;
let lst_items_connect_device = [];
let lst_items_pet_name = [];
let lst_items_pet_species = [];
let devices;
let curr_selected_device = "";
let log_odd_even = "odd";
const dropbox_item_template = [
  "<div title='%VALUE%'>",
  "<div class='dropdown_container_item' onclick='selectDropboxItem(this.parentElement, this)'>%VALUE%</div>",
  "</div>\r\n",
].join("\r\n");

const item_template = [
  "<div class='%ITEM%' id='%NAME1%%NAME2%' title='%NAME2%'>",
  "<button class='%BUTTON_CLASS%' onclick='%BUTTON_FUNC%(this.parentElement)'>-</button>",
  "<label for='%NAME1%_%NAME2%' onclick='%FUNC%(this.parentElement)'>%NAME2%</label>",
  "</div>\r\n",
].join("\r\n");

const change_log_template = `<div class="changelog_lines %TYPE%">
<div class="changelog_line">
    <div class="log_lockername">Device</div>
    <div class="log_lockername">Name</div>
    <div class="log_lockername">ID</div>
</div>
<div class="changelog_line">
    <div class="log">%DEVICE%</div>
    <div class="log">%NAME%</div>
    <div class="log">%ID%</div>
</div>
<div class="changelog_line">
    <div class="log_date">%DATE%</div>
    <div class="log"></div>
    <div class="log">Permission: %P%</div>
</div>
</div>`;

var options = {
  retain: true,
  qos: 1,
};

function CheckHoverDropdownContainer(Isin) {
  IsInDropdown = Isin;
}

function selectDropboxItem(item_title, selecteditem) {
  let dropdown_container = item_title.parentElement;
  dropdown_container.style.display = "none";
  document.getElementById(
    dropdown_container.id.replace("_container", "_input")
  ).value = selecteditem.textContent;
  dropdown_container.removeChild(item_title);
  dropdown_container.prepend(item_title);
}

function includeNewItemDropbox(dropbox_container, lstItems, item) {
  if (!listContain(lstItems, item)) {
    lstItems.push(item);
    let dropbox_item = dropbox_item_template.replace(/%VALUE%/g, item);
    dropbox_container.innerHTML = dropbox_item + dropbox_container.innerHTML;
  }
}

function IsDefined(obj) {
  return typeof obj != "undefined";
}

function includeItemsDropbox(dropbox_container, lstItems) {
  lstItems.forEach((el) => {
    lstItems.push(el);
    let dropbox_item = dropbox_item_template.replace(/%VALUE%/g, el);
    dropbox_container.innerHTML = dropbox_container.innerHTML + dropbox_item;
  });
}

function handle_msg(topic, message) {
  if (
    topic == `${connect_device.value}/nfc_setting` &&
    find_nfc_Btn.textContent == "Waiting..."
  ) {
    const json_data = JSON.parse(message.toString());
    if (json_data["type"] == "response") {
      nfc_id_input.value = json_data["value"];
      if (
        IsDefined(devices[connect_device.value]) &&
        IsDefined(devices[connect_device.value][json_data["value"]])
      ) {
        pet_name.value =
          devices[connect_device.value][json_data["value"]]["Name"];
        species.value =
          devices[connect_device.value][json_data["value"]]["Species"];
      } else {
        pet_name.value = "";
        species.value = "";
      }
      find_nfc_Btn.disabled = false;
      find_nfc_Btn.textContent = "Setup done";
    }
  } else if (topic == `${device_requested_del_nfc}/up`) {
    const json_data = JSON.parse(message.toString());
    if (json_data["type"] === "res") {
      if (
        json_data["data"]["req"] == "del_nfc" &&
        json_data["data"]["res"] == "ok"
      ) {
        is_requested_del_nfc = false;
        selected_nfc.remove();
        delete devices[device_requested_del_nfc][selected_nfc.title];
        device_requested_del_nfc = "";
        saveJsonData();
      }
    }
  }

  if (topic.includes("/up")) {
    let device_name = topic.replace("/up", "");
    const json_data = JSON.parse(message.toString());
    if (json_data["type"] === "nt") {
      if (json_data["data"]["nt"] === "nfc_scan") {
        let tmp_changelog = change_log_template.replace(
          "%DEVICE%",
          device_name
        );
        tmp_changelog = tmp_changelog.replace("%TYPE%", log_odd_even);
        tmp_changelog = tmp_changelog.replace(
          "%ID%",
          json_data["data"]["nfc_id"]
        );
        let curr_pet_name = "unknown";
        if (
          IsDefined(devices[device_name]) &&
          IsDefined(devices[device_name][json_data["data"]["nfc_id"]])
        ) {
          curr_pet_name =
            devices[device_name][json_data["data"]["nfc_id"]]["Name"];
        }
        tmp_changelog = tmp_changelog.replace("%NAME%", curr_pet_name);
        tmp_changelog = tmp_changelog.replace(
          "%P%",
          json_data["data"]["permission"]
        );
        let today = new Date();
        tmp_changelog = tmp_changelog.replace(
          "%DATE%",
          `${today.toLocaleDateString()} ${timeConversionSlicker(
            today.toLocaleTimeString()
          )}`
        );
        changelog_region.innerHTML += tmp_changelog;
        log_odd_even = log_odd_even == "odd" ? "even" : "odd";
      }
    }
  }
  console.log("topic is " + topic);
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  if (tabName == "data_info_content_tab") {
    changelog_headline.style.display = "flex";
  } else {
    changelog_headline.style.display = "none";
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function onDrdClick(container) {
  const drd_container = document.getElementById(container);
  if (drd_container.style.display != "block") {
    drd_container.style.display = "block";
  } else {
    drd_container.style.display = "none";
  }
}

function onDrdFocusOut(btnName) {
  if (IsInDropdown) return;
  document.getElementById(btnName).style.display = "none";
}

function listContain(lst_items, itembechecked) {
  for (var index in lst_items) {
    if (lst_items[index].toLowerCase() === itembechecked.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function Resize() {
  let contentArea = document.getElementById("contentArea");
  let Content_container = document.getElementById("Content_container");

  contentArea.style.height = (window.innerHeight - 30).toString() + "px";
  Content_container.style.height =
    (window.innerHeight - 70 - 35 - 30).toString() + "px";
}

function CreateDevicesElement(item, is_checked) {
  let label = document.createElement("label");
  label.classList.add("togglebutton_type2");
  label.textContent = item;
  let input = document.createElement("input");
  input.type = "checkbox";
  input.checked = is_checked;
  input.id = item;
  let span = document.createElement("span");
  span.classList.add("checkmark_type2");
  label.appendChild(input);
  label.appendChild(span);
  return label;
}

function getDevicesList(path) {
  devices = require(path);
  updateDevicesList(true);
}

function updateDevicesList(is_init = false) {
  devices_menu.innerHTML = "";
  Object.keys(devices).forEach(function (key) {
    devices_menu.innerHTML += item_template
      .replace(/%ITEM%/g, "device_line")
      .replace(/%NAME1%/g, "")
      .replace(/%NAME2%/g, key)
      .replace(/%BUTTON_CLASS%/g, "square_btn")
      .replace(/%BUTTON_FUNC%/g, "showDeviceInfo")
      .replace(/%FUNC%/g, "showDeviceInfo");
    if (is_init) {
      const req = {
        type: "request",
        value: false,
      };
      publish(`${key}/nfc_setting`, JSON.stringify(req), options);
      subscribe(`${key}/up`, { qos: 1 });
      // subscribe(`${key}/nfc_setting`, { qos: 1 });
    }
  });
}
function showDeviceInfo(selected_item) {
  monitor_nfc_region.innerHTML = "";
  let item_lines = document.getElementsByClassName("device_line");
  for (let device of item_lines) {
    device.className = device.className.replace(" active", "");
  }

  Object.keys(devices[selected_item.id]).forEach(function (nfc) {
    monitor_nfc_region.innerHTML += item_template
      .replace(/%ITEM%/g, "nfc_line")
      .replace(/%NAME1%/g, selected_item.id)
      .replace(/%NAME2%/g, nfc)
      .replace(/%BUTTON_CLASS%/g, "delete_btn")
      .replace(/%BUTTON_FUNC%/g, "deleteNFCInfo")
      .replace(/%FUNC%/g, "showNFCInfo");
  });
  selected_item.className += " active";
  curr_selected_device = selected_item.id;
}

function deleteNFCInfo(selected_item) {
  if (is_requested_del_nfc) return;
  const req = {
    type: "req",
    data: {
      req: "del_nfc",
      nfc_id: selected_item.title,
    },
  };
  device_requested_del_nfc = curr_selected_device;
  publish(`${device_requested_del_nfc}/down`, JSON.stringify(req), options);
  selected_nfc = selected_item;
  is_requested_del_nfc = true;
}

function showNFCInfo(selected_item) {
  info_nfc_region.innerHTML = "";
  let item_lines = document.getElementsByClassName("nfc_line");
  for (let nfc of item_lines) {
    nfc.className = nfc.className.replace(" active", "");
  }
  info_nfc_region.innerHTML += `<div>\tName: ${
    devices[curr_selected_device][selected_item.title]["Name"]
  }</div>`;
  info_nfc_region.innerHTML += `<div>\tSpecies: ${
    devices[curr_selected_device][selected_item.title]["Species"]
  }</div>`;
  selected_item.className += " active";
}

darkmode.addEventListener("change", () => {
  if (darkmode.checked) {
    setTheme("dark_theme");
  } else {
    setTheme("light_theme");
  }
});

connect_Btn.addEventListener("click", () => {
  const setting_region = document.getElementById("setting_region");
  if (connect_Btn.textContent == "Start connect") {
    if (connect_device.value == "") {
      console.log("Device??");
      return;
    }
    connect_Btn.textContent = "Disconnect";
    connect_device.disabled = true;
    // subscribe(connect_device.value, { qos: 1 });
    subscribe(connect_device.value + "/nfc_setting", { qos: 1 });
    if (!IsDefined(devices[connect_device.value])) {
      subscribe(connect_device.value + "/up", { qos: 1 });
    }
    // subscribe("testtopic", { qos: 1 });
    includeNewItemDropbox(
      connect_device_container,
      lst_items_connect_device,
      connect_device.value
    );
    setting_region.style.display = "block";
  } else {
    // unsubscribe(connect_device.value);
    unsubscribe(connect_device.value + "/nfc_setting");
    // unsubscribe("testtopic");
    connect_Btn.textContent = "Start connect";
    setting_region.style.display = "none";
    connect_device.disabled = false;
    find_nfc_Btn.textContent = "Read NFC";
    find_nfc_Btn.disabled = false;
    const req = {
      type: "request",
      value: false,
    };
    publish(
      `${connect_device.value}/nfc_setting`,
      JSON.stringify(req),
      options
    );
  }
});

find_nfc_Btn.addEventListener("click", () => {
  if (find_nfc_Btn.textContent == "Read NFC") {
    find_nfc_Btn.textContent = "Waiting...";
    find_nfc_Btn.disabled = true;
    const req = {
      type: "request",
      value: true,
    };
    publish(
      `${connect_device.value}/nfc_setting`,
      JSON.stringify(req),
      options
    );
  } else if (find_nfc_Btn.textContent == "Setup done") {
    if (!IsDefined(devices[connect_device.value]))
      devices[connect_device.value] = {};
    devices[connect_device.value][nfc_id_input.value] = {
      Name: `${pet_name.value}`,
      Species: `${species.value}`,
    };
    saveJsonData();
    updateDevicesList();
    find_nfc_Btn.textContent = "Read NFC";
    const req = {
      type: "request",
      value: false,
    };
    publish(
      `${connect_device.value}/nfc_setting`,
      JSON.stringify(req),
      options
    );
  }
});

clear_changelog.addEventListener("click", () => {
  removeAllChildNodes(changelog_region);
});

close_Btn.addEventListener("click", () => {
  remove_callback(handle_msg);
  ipc.send("closeApp");
});

maxRes_Btn.addEventListener("click", () => {
  ipc.send("maxResApp");
});

minimize_Btn.addEventListener("click", () => {
  ipc.send("minimizeApp");
});

ipc.on("isMaximized", () => {
  changeMaxResBtn(true);
});

ipc.on("isRestored", () => {
  changeMaxResBtn(false);
});

function saveJsonData() {
  const strJSON = JSON.stringify(devices);
  fs.writeFile("./data/devices.json", strJSON, function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
}

function changeMaxResBtn(isMaximizedApp) {
  if (isMaximizedApp) {
    maxRes_Btn.title = "Restore";
    maxRes_Btn.classList.remove("maximizeBtn");
    maxRes_Btn.classList.add("resotreBtn");
  } else {
    maxRes_Btn.title = "Maximize";
    maxRes_Btn.classList.remove("resotreBtn");
    maxRes_Btn.classList.add("maximizeBtn");
  }
}

function checkHoverDropdownContainer(Isin) {
  IsInDropdown = Isin;
}

function removeAllChildNodes(div) {
  while (div.hasChildNodes()) {
    div.removeChild(div.firstChild);
  }
}

function timeConversionSlicker(s) {
  if (!s.toLowerCase().includes("am") && !s.toLowerCase().includes("pm"))
    return s;
  let AMPM = s.slice(-2);
  let timeArr = s.slice(0, -2).split(":");
  if (AMPM === "AM" && timeArr[0] === "12") {
    // catching edge-case of 12AM
    timeArr[0] = "00";
  } else if (AMPM === "PM") {
    // everything with PM can just be mod'd and added with 12 - the max will be 23
    timeArr[0] = (timeArr[0] % 12) + 12;
  }
  return timeArr.join(":").replace(/ /g, "");
}

// function to toggle between light and dark theme
function setTheme(themeName) {
  localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
}

function initTheme() {
  if (localStorage.getItem("theme") === "dark_theme") {
    setTheme("dark_theme");
    darkmode.checked = true;
  } else {
    setTheme("light_theme");
    darkmode.checked = false;
  }
}

// Immediately invoked function on initial load
initTheme();
Resize();
connect_server(["mqtt://test.mosquitto.org"]);
add_callback(handle_msg);
getDevicesList("../data/devices.json");

includeItemsDropbox(connect_device_container, lst_items_connect_device);
includeItemsDropbox(pet_name_container, lst_items_pet_name);
includeItemsDropbox(species_container, lst_items_pet_species);
window.selectDropboxItem = selectDropboxItem;
window.checkHoverDropdownContainer = checkHoverDropdownContainer;
window.openTab = openTab;
window.onDrdClick = onDrdClick;
window.onDrdFocusOut = onDrdFocusOut;
window.showDeviceInfo = showDeviceInfo;
window.showNFCInfo = showNFCInfo;

const {
  connect_server,
  publish,
  subscribe,
  unsubscribe,
} = require("../src/mqtt_client.js");
const { ipcRenderer } = require("electron");
const { connect } = require("mqtt");
const ipc = ipcRenderer;

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
const pet_name_container = document.getElementById("pet_name_container");
const pet_name = document.getElementById("pet_name_input");
const species_container = document.getElementById("species_container");
const species = document.getElementById("species_input");

//Global variables for js
let IsInDropdown = false;
let lst_items_connect_device = [];
let lst_items_pet_name = [];
let lst_items_pet_species = [];

const dropbox_item_template = [
  "<div title='%VALUE%'>",
  "<div class='dropdown_container_item' onclick='selectDropboxItem(this.parentElement, this)'>%VALUE%</div>",
  "</div>\r\n",
].join("\r\n");

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

function includeItemsDropbox(dropbox_container, lstItems) {
  lstItems.forEach((el) => {
    lstItems.push(el);
    let dropbox_item = dropbox_item_template.replace(/%VALUE%/g, el);
    dropbox_container.innerHTML = dropbox_container.innerHTML + dropbox_item;
  });
}

function handle_msg(topic, message) {
  // if (topic == "")
  console.log("message is " + message);
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
    subscribe(connect_device.value, handle_msg, { qos: 1 });
    subscribe(connect_device.value + "/nfc_setting", handle_msg, { qos: 1 });
    // subscribe("testtopic", handle_msg, { qos: 1 });
    includeNewItemDropbox(
      connect_device_container,
      lst_items_connect_device,
      connect_device.value
    );
    setting_region.style.display = "block";
  } else {
    unsubscribe(connect_device.value, handle_msg);
    unsubscribe(connect_device.value + "/nfc_setting", handle_msg);
    // unsubscribe("testtopic", handle_msg);
    connect_Btn.textContent = "Start connect";
    setting_region.style.display = "none";
    connect_device.disabled = false;
  }
});

find_nfc_Btn.addEventListener("click", () => {
  if (find_nfc_Btn.textContent == "Read NFC") {
    find_nfc_Btn.textContent = "Waiting...";
    find_nfc_Btn.disabled = true;
  } else if (find_nfc_Btn.textContent == "Setup done") {
    find_nfc_Btn.textContent = "Read NFC";
  }
});

close_Btn.addEventListener("click", () => {
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

includeItemsDropbox(connect_device_container, lst_items_connect_device);
includeItemsDropbox(pet_name_container, lst_items_pet_name);
includeItemsDropbox(species_container, lst_items_pet_species);
window.selectDropboxItem = selectDropboxItem;
window.checkHoverDropdownContainer = checkHoverDropdownContainer;
window.openTab = openTab;
window.onDrdClick = onDrdClick;
window.onDrdFocusOut = onDrdFocusOut;

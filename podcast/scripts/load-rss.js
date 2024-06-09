"use strict";

const load = (RSS_URL) =>
  fetch(RSS_URL)
    .then((response) => response.text())
    .then((xml) => new window.DOMParser().parseFromString(xml, "text/xml"))
    .then((data) => Array.from(data.getElementsByTagName("item")));

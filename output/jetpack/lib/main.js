var pageMod = require("page-mod");
const data = require("self").data;
var tabs = require("tabs");

pageMod.PageMod({
  include: ["https://bugzilla.mozilla.org/show_bug.cgi*"],
  contentScriptWhen: "ready",
  contentScriptFile: [data.url("jquery.js"), data.url("md5.js"), data.url("date.js"), data.url("bugzilla.js"), data.url("style.js")],
});

//tabs.open("https://bugzilla.mozilla.org/show_bug.cgi?id=622610");


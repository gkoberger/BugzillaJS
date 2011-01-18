var pageMod = require("page-mod");
const data = require("self").data;
var tabs = require("tabs");

pageMod.PageMod({
  include: ["https://bugzilla.mozilla.org/show_bug.cgi*"],
  contentScriptWhen: "ready",
  contentScriptFile: INCLUDE_JS,
});

//tabs.open("https://bugzilla.mozilla.org/show_bug.cgi?id=622610");


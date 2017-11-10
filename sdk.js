const webext = require("sdk/webextension");
const ss = require("sdk/simple-storage");

function setSyncLegacyDataPort(port) {
    // Send the initial data dump.
    port.postMessage({
        storage: ss.storage,
    });
};

webext.startup().then(({browser}) => {
    browser.runtime.onConnect.addListener(port => {
        if (port.name === "sync-legacy-addon-data") {
            setSyncLegacyDataPort(port);
        }
    });
});

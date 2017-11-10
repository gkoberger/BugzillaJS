"use strict";


function getSDKData() {
    // Ask to the legacy part to dump the needed data and send it back
    // to the background page...
    var port = browser.runtime.connect({name: "sync-legacy-addon-data"});
    port.onMessage.addListener((msg) => {
        if (msg) {
            // Where it can be saved using the WebExtensions storage API.
            browser.storage.sync.set(msg.storage);
        }
    });
}

browser.storage.sync.get(null).then(stored => {
    // If we don't have any data stored then import from the SDK.
    if (Object.keys(stored).length === 0) {
        getSDKData();
    }
});

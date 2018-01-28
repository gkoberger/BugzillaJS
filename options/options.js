browser.storage.sync.get().then((result) => {
    for (let [setting, value] of Object.entries(result)) {
        if (!setting.startsWith("settings_")) {
            continue;
        }
        let checkbox = document.getElementById(setting.replace(/^settings_/, ""));
        if (!checkbox) {
            continue;
        }
        checkbox.checked = value;
    }
    console.log(result);
});

document.getElementById("prefs").addEventListener("change", function onChange(event) {
    let setting_name = 'settings_' + event.target.id;
    browser.storage.sync.set({
        [setting_name]: event.target.checked,
    });
});

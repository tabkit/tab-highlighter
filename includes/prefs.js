/*
 * Stores the required constants and hardcoded default preferences
 * Also declare global and local preference service
 */

const PREF_BRANCH = "extensions.tabkit.tab-highlighter.";
// Default pref values
const PREFS = {
  highlightCurrentTab: true,
  boldCurrentTab: true,
  highlightUnreadTab: true
};

// Make sure we can use gPrefService from now on (even if this isn't a browser window!)
if (typeof globalPrefs == "undefined" || !globalPrefs) {
  var globalPrefs = Cc["@mozilla.org/preferences-service;1"].
           getService(Ci.nsIPrefBranch);
}

var localPrefs = Cc["@mozilla.org/preferences-service;1"]
                 .getService(Ci.nsIPrefService)
                 .getBranch(PREF_BRANCH);

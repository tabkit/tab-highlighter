var {unload} = require("unload");
var {log, debug, dump} = require("console");


/**
 * Get the preference value of type specified in PREFS
 */

exports.getPref = function (key, aDefault) {
  // Cache the prefbranch after first use
  if (exports.getPref.branch == null)
    exports.getPref.branch = Services.prefs.getBranch(PREF_BRANCH);

  var prefType = exports.getPref.branch.getPrefType(key);
  // underlying preferences object throws an exception if pref doesn't exist
  if (prefType == exports.getPref.branch.PREF_INVALID) {
    if (typeof aDefault !== "undefined") {
      return PREFS[key];
    } else {
      return aDefault;
    }
  }

  // Figure out what type of pref to fetch
  switch (typeof PREFS[key]) {
    case "boolean":
      return exports.getPref.branch.getBoolPref(key);
    case "number":
      return exports.getPref.branch.getIntPref(key);
    case "string":
      return exports.getPref.branch.getCharPref(key);
    default:
      return null;
  }
}

/**
 * Set the new preference value
 */

exports.setPref = function (key, aValue) {
  // Cache the prefbranch after first use
  if (setPref.branch == null)
    setPref.branch = Services.prefs.getBranch(PREF_BRANCH);

  if (typeof aValue !== typeof PREFS[key]) {
    debug('setPref error: aValue('+aValue+') type is different from PREFS['+key+']');
  }

  // Figure out what type of pref to fetch
  switch (typeof PREFS[key]) {
    case "boolean":
      setPref.branch.setBoolPref(key);
      break;
    case "number":
      setPref.branch.setIntPref(key);
      break;
    case "string":
      setPref.branch.setCharPref(key);
      break;
    default:
      break;
  }
}

/**
 * Initialize default preferences specified in PREFS
 */
exports.setDefaultPrefs = function () {
  let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
  for (let [key, val] in Iterator(PREFS)) {
    switch (typeof val) {
      case "boolean":
        branch.setBoolPref(key, val);
        break;
      case "number":
        branch.setIntPref(key, val);
        break;
      case "string":
        branch.setCharPref(key, val);
        break;
      default:
        break;
    }
  }
}



//==================== Preference Observer/Listener ====================
exports.PREF_OBSERVER = {
  observe: function(aSubject, aTopic, aData) {
    if ("nsPref:changed" != aTopic) {
      return;
    }
    // aData is the pref key here
    if (!(aData in PREFS)) {
      return;
    }

    exports.prefChangeListeners.forEach(function(listener) {
      // listener is someimtes set to null disabled
      if (!listener) {
        return;
      }

      listener(aData);
    });
  }
}

// All listeners for hearing preference change are here
exports.prefChangeListeners = [];

/**
 * Register observer `PREF_OBSERVER` for given preference branch
 *
 * @param [nsIPrefBranch] localPrefBranch:
 * Example: Cc["@mozilla.org/preferences-service;1"]
             .getService(Ci.nsIPrefService)
             .getBranch(PREF_BRANCH);
 */
exports.registerPrefObserver = function (localPrefBranch) {
  localPrefBranch.addObserver("", exports.PREF_OBSERVER, false);
  unload(function() localPrefBranch.removeObserver("", exports.PREF_OBSERVER));
}
//==================== Preference Observer/Listener ====================



//==================== Preference Attribute Mapper ====================
/**
 * Observe Preference change, and manipulate the *node*'s attribute (with attributeName)
 *
 * @param [string] prefKey: Preferences keys, will prepend PREF_BRANCH for you
 * @param [object] node: The DOM node to add/change attribute
 * @param [string] attributeName: The name is attribute to add/change
 * @param [function] attributeValueFunc: The function to return the value of attribute to be set, if undefined is returned, will remove the attribute
 */
exports.mapPrefToAttribute = function (prefKey, node, attributeName, attributeValueFunc) {
  // This listener must accept `aData` as parameter
  // See `PREF_OBSERVER.observe`
  var listener = function(aData) {
    // aData is the pref key already
    var prefValue = exports.getPref(aData);
    var newValue = attributeValueFunc(prefValue);

    if (newValue !== undefined) {
      node.setAttribute(attributeName, newValue);
    }
    else {
      node.removeAttribute(attributeName);
    }
  }

  var newListenerIndex = exports.prefChangeListeners.push(listener) - 1; // Minus one here since `push` return new length
  unload(function() {
    exports.prefChangeListeners[newListenerIndex] = null;
  });

  listener(prefKey);
};

/**
 * Observe Boolean Preference change, and add/remove the *node*'s attribute (with attributeName) based whether the pref value is truthy or not
 *
 * @param [string] prefKey: Preferences keys, will prepend PREF_BRANCH for you
 * @param [object] node: The DOM node to add/change attribute
 * @param [string] attributeName: The name is attribute to add/remove
 */
exports.mapBoolPrefToAttribute = function (prefKey, node, attributeName) {
  try {
    exports.mapPrefToAttribute(prefKey, node, attributeName, function(prefValue) {
      return prefValue ? "true" : undefined;
    });
  } catch (ex) {
    debug('mapBoolPrefToAttribute failed, prefKey: '+prefKey+', node: '+node+', attributeName: '+attributeName);
  }
};
//==================== Preference Attribute Mapper ====================

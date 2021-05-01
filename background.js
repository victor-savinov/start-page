/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Global variables
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var bookmarks = [],
	previews = {};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get('bookmarks', function(items) {
	if (items.hasOwnProperty('bookmarks')) {
		bookmarks = items.bookmarks;
	}
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var name in changes) {
        var value = changes[name].newValue;

        if (name === 'bookmarks') {
        	bookmarks = value;
        }
    }
});

chrome.tabs.onActivated.addListener(function(object) {
	chrome.tabs.get(object.tabId, function(tab) {
		if (tab.status === 'complete' && !previews[tab.url]) {
			for (var i = 0, l = bookmarks.length; i < l; i++) {
				var bookmark = bookmarks[i];

				if (bookmark.url === tab.url) {
					chrome.tabs.captureVisibleTab(tab.windowId, function(string) {
						var preview = {};

						preview[tab.url] = string;
						previews[tab.url] = true;

						chrome.storage.local.set(preview);
					});
				}
			}
		}
	});
});

chrome.tabs.onUpdated.addListener(function(id, changes, tab) {
	if (tab.active === true && tab.status === 'complete' && !previews[tab.url]) {
		for (var i = 0, l = bookmarks.length; i < l; i++) {
			var bookmark = bookmarks[i];

			if (bookmark.url === tab.url) {
				chrome.tabs.captureVisibleTab(tab.windowId, function(string) {
					var preview = {};

					preview[tab.url] = string;
					previews[tab.url] = true;

					chrome.storage.local.set(preview)
				});
			}
		}
	}
});
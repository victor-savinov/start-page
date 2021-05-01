/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Global variables
# Bookmarks
# User interface
	# Context menu
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var bookmarks = [];


/*--------------------------------------------------------------
# BOOKMARKS
--------------------------------------------------------------*/

function createBookmark(name, url) {
	var bookmark = {
		name,
		url
	};

	bookmarks.push(bookmark);

	renderBookmark(bookmarks, bookmarks.length - 1);

	chrome.storage.local.set({ bookmarks });
}

function renderBookmark(parent, index) {
	var bookmark = parent[index],
		item = document.createElement('a');

	item.className = 'item';

	item.href = bookmark.url;
	item.innerHTML = '<span class="item__preview"></span><span class="item__label">' + bookmark.name + '</span>';

	chrome.storage.local.get(bookmark.url, function(items) {
		if (items[bookmark.url]) {
			item.querySelector('.item__preview').style.backgroundImage = 'url(' + items[bookmark.url] + ')'; 
		}
	});

	item.skeleton = {
		parent,
		index
	};

	item.addEventListener('contextmenu', function(event) {
		event.preventDefault();

		openContextMenu(event.clientX, event.clientY, this);

		return false;
	});

	document.querySelector('main').insertBefore(item, document.querySelector('.item--new'));
}


/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

document.querySelector('.item--new').addEventListener('click', function() {
	createBookmark(prompt('Name'), prompt('URL'));
});


/*--------------------------------------------------------------
# CONTEXT MENU
--------------------------------------------------------------*/

function openContextMenu(x, y, element) {
	var container = document.createElement('div');

	container.className = 'context-menu';

	container.style.left = x + 'px';
	container.style.top = y + 'px';

	container.element = element;

	function close() {
		document.querySelector('.context-menu').remove();

		window.removeEventListener('click', close);
	}

	window.addEventListener('click', close);

	var remove_button = document.createElement('button');

	remove_button.textContent = 'Remove';
	remove_button.addEventListener('click', function() {
		var skeleton = this.parentNode.element.skeleton;

		this.parentNode.element.remove();
		delete skeleton.parent.splice(skeleton.index, 1);

		chrome.storage.local.set({ bookmarks });
	});

	container.appendChild(remove_button);

	var rename_button = document.createElement('button');

	rename_button.textContent = 'Rename';
	rename_button.addEventListener('click', function() {
		var skeleton = this.parentNode.element.skeleton,
			name = prompt('Name', skeleton.parent[skeleton.index].name);

		this.parentNode.element.querySelector('.item__label').textContent = name;
		skeleton.parent[skeleton.index].name = name;

		chrome.storage.local.set({ bookmarks });
	});

	container.appendChild(rename_button);

	var change_url_button = document.createElement('button');

	change_url_button.textContent = 'Change URL';
	change_url_button.addEventListener('click', function() {
		var skeleton = this.parentNode.element.skeleton,
			url = prompt('URL', skeleton.parent[skeleton.index].url);

		this.parentNode.element.href = url;
		skeleton.parent[skeleton.index].url = url;

		chrome.storage.local.set({ bookmarks });
	});

	container.appendChild(change_url_button);

	document.body.appendChild(container);
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get('bookmarks', function(items) {
	if (items.hasOwnProperty('bookmarks')) {
		bookmarks = items.bookmarks;

		for (var i = 0, l = bookmarks.length; i < l; i++) {
			var bookmark = bookmarks[i];

			renderBookmark(bookmarks, i);
		}
	}
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var name in changes) {
        var value = changes[name].newValue;

        if (name === 'bookmarks') {
        	bookmarks = value;

        	var items = document.querySelectorAll('.item:not(.item--new)');

        	for (var i = items.length - 1; i > -1; i--) {
        		items[i].remove();
        	}

        	for (var i = 0, l = bookmarks.length; i < l; i++) {
				var bookmark = bookmarks[i];

				renderBookmark(bookmarks, i);
			}
        }
    }
});
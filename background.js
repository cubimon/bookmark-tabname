
let urlToTabnameMap = {}

function visitBookmarks(bookmarkNodes) {
	if (!Array.isArray(bookmarkNodes)) {
		return;
	}
	for (const bookmarkNode of bookmarkNodes) {
		if (bookmarkNode?.url && bookmarkNode?.url) {
			urlToTabnameMap[bookmarkNode.url] = bookmarkNode.title;
		}
		visitBookmarks(bookmarkNode?.children);
	}
}

function setTitle(title) {
	document.title = title;
}

function visitTab(tabs) {
	for (const tab of tabs) {
		if (tab.url.startsWith("chrome://")) {
			continue;
		}
		if (!(tab.url in urlToTabnameMap)) {
			continue;
		}
		chrome.scripting.executeScript({
			target: {tabId: tab.id},
			func: setTitle,
			args: [urlToTabnameMap[tab.url]],
		});
	}

}

chrome.bookmarks.getTree(visitBookmarks);

chrome.tabs.query({}, visitTab);

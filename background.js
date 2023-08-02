
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

function setTabTitleIfBookmark(tab) {
	if (tab.url.startsWith("chrome://")) {
		return;
	}
	if (!(tab.url in urlToTabnameMap)) {
		return;
	}
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: setTitle,
		args: [urlToTabnameMap[tab.url]],
	});
}

function visitTab(tabs) {
	for (const tab of tabs) {
		setTabTitleIfBookmark(tab);
	}

}

function tabUpdated(tabId, changeInfo, tab) {
	setTabTitleIfBookmark(tab);
}

chrome.bookmarks.getTree(visitBookmarks);

chrome.tabs.query({}, visitTab);
chrome.tabs.onUpdated.addListener(tabUpdated);


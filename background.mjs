import { setTabTitle, getTabValue } from "./common.mjs";

/**
 * @type {Object<string | RegExp, string>} cached rules from bookmarks.
 */
let rules = await chrome.storage.local.get("rules")?.rules ?? {};

/**
 * 
 * @param {chrome.bookmarks.BookmarkTreeNode[]} bookmarkNodes 
 */
function visitBookmarksRoot(bookmarkNodes) {
	rules = {};
	visitBookmarks(bookmarkNodes);
	chrome.storage.local.set({ "rules": rules });
	console.log("full url to tabname map:", rules);
}

/**
 * pulls bookmarks to create rules, then updates all tab title if according to new rules.
 */
async function updateRulesCache() {
	visitBookmarksRoot(await chrome.bookmarks.getTree());
	visitTabs(await chrome.tabs.query({}));
}

/**
 * 
 * @param {chrome.bookmarks.BookmarkTreeNode[]} bookmarkNodes 
 */
function visitBookmarks(bookmarkNodes) {
	if (!Array.isArray(bookmarkNodes)) {
		return;
	}
	for (const bookmarkNode of bookmarkNodes) {
		if (bookmarkNode?.url) {
			rules[bookmarkNode.url] = bookmarkNode.title;
		}
		visitBookmarks(bookmarkNode?.children);
	}
}

/**
 * 
 * @param {chrome.tabs.Tab} tab 
 */
async function setTabTitleIfBookmark(tab) {
	if (tab.url.startsWith("chrome://")) {
		return;
	}
	if (!(tab.url in rules)) {
		return;
	}
	await setTabTitle(tab, rules[tab.url]);
}

/**
 * 
 * @param {chrome.tabs.Tab} tab 
 */
async function setTabTitleIfUserDefined(tab) {
	const title = await getTabValue(tab, "title");
	if (!title) {
		return;
	}
	await setTabTitle(tab, title);
}

/**
 * Changes tab title based on bookmarks.
 * 
 * @param {chrome.tabs.Tab[]} tabs 
 */
async function visitTabs(tabs) {
	for (const tab of tabs) {
		setTabTitleIfBookmark(tab);
		await setTabTitleIfUserDefined(tab);
	}
}

/**
 * 
 * @param {number} tabId
 * @param {chrome.tabs.OnUpdatedInfo} changeInfo
 * @param {chrome.tabs.Tab} tab
 */
async function tabUpdated(tabId, changeInfo, tab) {
	setTabTitleIfBookmark(tab);
	if (changeInfo.status === "complete") {
		await setTabTitleIfUserDefined(tab);
	}
}

// bookmark changes
const ruleUpdateChanges = [
	chrome.bookmarks.onChanged,
	chrome.bookmarks.onCreated,
	chrome.bookmarks.onRemoved,
];
ruleUpdateChanges.forEach(change => {
	change.addListener(updateRulesCache);
})

// tab changes
chrome.tabs.onUpdated.addListener(tabUpdated);

await updateRulesCache();

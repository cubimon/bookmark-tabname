/**
 * stores a value for the given tab, works only on firefox.
 * 
 * @param {chrome.tabs.Tab} tab 
 * @param {string} key 
 * @returns @type {string  | object | undefined}
 */
export async function getTabValue(tab, key) {
	if (!tab?.id) {
		console.error("can't get value for tab", tab, key);
		return;
	}
	return await chrome.sessions.getTabValue(tab.id, key);
}

/**
 * stores a value for the given tab, works only on firefox.
 * 
 * @param {chrome.tabs.Tab} tab 
 * @param {string} key 
 * @param {string | object} value 
 */
export async function setTabValue(tab, key, value) {
	if (!tab?.id) {
		console.error("can't set value for tab", tab, key, value);
		return;
	}
	await chrome.sessions.setTabValue(tab.id, key, value);
}

/**
 * removes a key for the given tab, works only on firefox.
 * 
 * @param {chrome.tabs.Tab} tab 
 * @param {string} key 
 */
export async function removeTabValue(tab, key) {
	if (!tab?.id) {
		console.error("can't remove key from tab", tab, key);
		return;
	}
	await chrome.sessions.removeTabValue(tab.id, key);
}

/**
 * 
 * @param {chrome.tabs.Tab} tab
 * @param {string} title
 */
export async function setTabTitle(tab, title) {
	if (!tab?.id) {
		console.error("can't set title of tab", tab);
		return;
	}
	if (tab?.discarded) {
		return;
	}
	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: (title) => {
			if (!globalThis?.oldTitle) {
				globalThis.oldTitle = document.title;
			}
			document.title = title;
			if (globalThis?.activeTitleObserver) {
				globalThis.activeTitleObserver.disconnect();
			}
			globalThis.activeTitleObserver = new MutationObserver(() => {
				if (document.title !== title) {
					globalThis.oldTitle = document.title;
					document.title = title;
				}
			});
			globalThis.activeTitleObserver.observe(document.querySelector("title"), { childList: true });
		},
		args: [title]
	});
}

/**
 * restores original tab title if it was customized.
 * 
 * @param {chrome.tabs.Tab} tab
 */
export async function setOriginalTabTitle(tab) {
	if (!tab?.id) {
		console.error("can't set title of tab", tab);
		return;
	}
	if (tab?.discarded) {
		return;
	}
	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: () => {
			if (globalThis?.activeTitleObserver) {
				globalThis.activeTitleObserver.disconnect();
			}
			if (globalThis?.oldTitle) {
				document.title = globalThis.oldTitle;
			}
		},
		args: []
	});
}
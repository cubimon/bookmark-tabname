import { setTabTitle, setOriginalTabTitle, setTabValue, removeTabValue } from "./common.mjs";

/**
 * 
 * @returns @type {chrome.tabs.Tab}
 */
async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

/** @type {HTMLTextAreaElement} */
const input = document.getElementById("tabname");

input.addEventListener("keydown", async (e) => {
	if (e.key === "Enter") {
		const text = input.value;
		const currentTab = await getCurrentTab();
		if (text) {
			setTabTitle(currentTab, text);
			setTabValue(currentTab, "title", text);
		} else {
			setOriginalTabTitle(currentTab);
			removeTabValue(currentTab, "title");
		}
		window.close();
	}
});

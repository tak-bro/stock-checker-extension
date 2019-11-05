let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    if (message === 'REFRESH_PAGE') {
        chrome.tabs.reload(tabId);
        console.log(`reloaded! ${count++}`);
        respond('RELOADED');
    } else {
        console.log(`Message: ${message}, TabId: ${tabId}`);
    }

    return true;
});
let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    if (message === 'REFRESH_PAGE') {
        chrome.tabs.reload(tabId);
        respond('reloaded');
        console.log(`reloaded! ${count++}`);
        setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { message: 'CHECK_CART_FORM', tabId: tabId });
            console.log('sended message!');
        }, 5000);
    } else {
        console.log(`Message: ${message}, TabId: ${tabId}`);
    }
});
let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    if (message === 'REFRESH_PAGE') {
        chrome.tabs.reload(tabId);
        console.log(`reloaded! ${count++}`);
        setTimeout(() => {
            respond('RELOADED');
        }, 5000);
    } else if (message === 'INITIAL_LOAD') {
        chrome.tabs.sendMessage(tabId, { message: 'CHECK_CART_FORM', tabId }, res => {
            console.log(`Message: ${message}, TabId: ${tabId}, Res: ${res}`);
            respond(res);
        });
    } else {
        console.log(`Message: ${message}, TabId: ${tabId}`);
        respond('unknown message from Background');
    }

    return true;
});

let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    switch (message) {
        case 'REFRESH_PAGE':
            chrome.tabs.reload(tabId);
            console.log(`Reloaded! ${count++} times`);
            respond('RELOADED');
            break;
        case 'INITIAL_LOAD':
            chrome.tabs.sendMessage(tabId, { message: 'CONTENT_CHECK_CART_FORM', tabId }, res => {
                respond(res || 'REFRESH'); // SUCCESS or REFRESH
            });
            break;
        case 'SUCCESS_TO_ADD':
            console.log(`Success to add item on ${new Date().toString()}`);
            break;
        default:
            console.log(`Message: ${message}, TabId: ${tabId}`);
            break;
    }

    return true;
});

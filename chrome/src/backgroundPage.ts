let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    switch (message) {
        case 'CHECK_IN_PRODUCT':
            chrome.tabs.sendMessage(tabId, { message: 'CONTENT_CHECK_PRODUCT_FORM', tabId }, res => {
                respond(res || 'REFRESH'); // SUCCESS or REFRESH
            });
            break;
        case 'CHECK_IN_CART':
            chrome.tabs.sendMessage(tabId, { message: 'CONTENT_CHECK_CART_FORM', tabId }, res => {
                respond(res || 'REFRESH'); // SUCCESS or REFRESH
            });
            break;
        case 'REFRESH_PAGE':
            console.log(`Reloaded! ${count++} times on ${new Date().toLocaleString()}`);
            chrome.tabs.reload(tabId);
            respond('RELOADED');
            break;
        case 'ITEM_IN_STOCK':
            console.log(`Item In Stock on ${new Date().toLocaleString()}!`);
            // 메세지 전달 후에도 계속 리프레시...
            chrome.tabs.reload(tabId);
            respond('RELOADED');
            break;
        default:
            console.log(`Message: ${message}, TabId: ${tabId}`);
            break;
    }

    return true;
});

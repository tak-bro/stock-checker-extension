let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    switch (message) {
        case 'INITIAL_LOAD':
            chrome.tabs.sendMessage(tabId, { message: 'CONTENT_CHECK_CART_FORM', tabId }, res => {
                respond(res || 'REFRESH'); // SUCCESS or REFRESH
            });
            break;
        case 'REFRESH_PAGE':
            console.log(`Reloaded! ${count++} times`);
            chrome.tabs.reload(tabId);
            respond('RELOADED');
            break;
        case 'SUCCESS_TO_ADD':
            console.log(`Success to add item on ${new Date().toString()}`);
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

const REFRESH_DELAY = 5000;
let count = 0;

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { message, tabId } = request;
    switch (message) {
        case 'SUCCESS_TO_ADD':
            console.log(`Success to add item on ${new Date().toString()}`);
            chrome.tabs.remove(tabId);
            break;
        case 'REFRESH_PAGE':
            chrome.tabs.reload(tabId);
            console.log(`Reloaded! ${count++}`);
            setTimeout(() => { respond('RELOADED'); }, REFRESH_DELAY);
            break;
        case 'INITIAL_LOAD':
            chrome.tabs.sendMessage(tabId, { message: 'CHECK_CART_FORM', tabId }); // 여기서 respond 받으면 간헐적으로 에러 발생
            respond('REFRESH'); // 강제로 계속 refresh...
            break;
        default:
            console.log(`Message: ${message}, TabId: ${tabId}`);
            respond('Unknown message from backgroundPage');
            break;
    }

    return true;
});

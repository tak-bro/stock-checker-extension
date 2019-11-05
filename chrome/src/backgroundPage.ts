import { throwError } from 'rxjs/internal/observable/throwError';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        throwError('request is empty');
    }

    const { message, tabId } = request;
    if (message === 'REFRESH_PAGE') {
        chrome.tabs.reload();
        setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { message: 'CHECK_CART_FORM', tabId: tabId });
        }, 3000);
    } else if (message === 'STOP_REFRESH') {
        // do nothing
    }
});
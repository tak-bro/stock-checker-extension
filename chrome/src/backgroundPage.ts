import { throwError } from 'rxjs/internal/observable/throwError';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        throwError('request is empty');
    }

    const { message, tabId } = request;
    if (message === 'REFRESH_PAGE') {
        setTimeout(() => {
            chrome.tabs.reload();
            chrome.tabs.sendMessage(tabId, { message: 'CHECK_CART_FORM', tabId: tabId }, res => {
                console.log(res);
            });
        }, 4000);
    } else if (message === 'STOP_REFRESH') {
        // do nothing
    }
});
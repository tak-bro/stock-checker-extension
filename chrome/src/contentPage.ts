import { of } from 'rxjs';
import {delay, filter, map, retry, switchMap, tap} from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import {bindCallback} from 'rxjs/internal/observable/bindCallback';
import {Observable} from 'rxjs/internal/Observable';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { tabId, message } = request;
    if (message === 'CHECK_CART_FORM') {
        let cartFormElement = document.getElementById('addToCartFormHolder');
        const checkCartFormElement$ = of(cartFormElement).pipe(
            filter((cartForm) => {
                if (!cartForm) {
                    cartFormElement = document.getElementById('addToCartFormHolder');
                }
                return cartForm ? true : false;
            }),
            delay(300),
            switchMap((cartForm) => {
                // check form element
                const isHideCartForm = cartForm.classList.contains('hide');
                return of(isHideCartForm);
            })
        );

        const addToCart$ = checkCartFormElement$.pipe(
            filter(isHide => isHide ? false : true),
            switchMap(() => of(document.getElementById('addToCartSubmit'))),
            tap((addToCartButtonElement) => addToCartButtonElement.click()),
            switchMap((addToCartButtonElement) => fromEvent(addToCartButtonElement, 'click')),
            map(() => 'done'),
        );

        const refreshPage$ = checkCartFormElement$.pipe(
            filter(isHide => isHide ? true : false),
            switchMap(() => {
                const sendMessageStructure = (message: any, callback: (result: any) => void) => chrome.runtime.sendMessage(message, callback);
                const sendMessageCallback$ = bindCallback(sendMessageStructure);
                return sendMessageCallback$({ message: 'REFRESH_PAGE', tabId: tabId });
            }),
            filter(res => res === 'RELOADED' ? true : false),
        );

        addToCart$.subscribe(res => respond(res));
        refreshPage$.subscribe(res => respond(res));
    } else {
        console.log(`Message: ${message}, TabId: ${tabId}`);
    }

    return true;
});
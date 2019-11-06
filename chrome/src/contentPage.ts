import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }
    const { tabId, message } = request;

    if (message !== 'CHECK_CART_FORM') {
        console.log(`Message: ${message}, TabId: ${tabId}`);
        respond('Unknown message from ContentPage');
    }

    // start check element logic
    let cartFormElement = document.getElementById('addToCartFormHolder');
    const checkCartFormElement$ = of(cartFormElement).pipe(
        tap(cartForm => {
            if (!cartForm) {
                cartFormElement = document.getElementById('addToCartFormHolder');
            }
        }),
        filter(cartForm => cartForm.classList ? true : false),
        switchMap(cartForm => {
            // check form element
            const isHideCartForm = cartForm.classList.contains('hide');
            return of(isHideCartForm);
        })
    );

    const addToCart$ = checkCartFormElement$.pipe(
        filter(isHide => isHide ? false : true),
        switchMap(() => of(document.getElementById('addToCartSubmit'))),
        tap(addToCartButtonElement => addToCartButtonElement.click()),
        switchMap(addToCartButtonElement => fromEvent(addToCartButtonElement, 'click')),
        tap(() => {
            chrome.runtime.sendMessage({ message: 'SUCCESS_TO_ADD', tabId });
        }),
        map(() => 'DONE') // 이게 소용이 없음
    );

    const refreshPage$ = checkCartFormElement$.pipe(
        filter(isHide => isHide ? true : false),
        map(() => 'REFRESH') // 이게 소용이 없음
    );

    addToCart$.subscribe(res => respond(res));
    refreshPage$.subscribe(res => respond(res));
    return true;
});

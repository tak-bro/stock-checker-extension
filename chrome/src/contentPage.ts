import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }
    const { tabId, message } = request;

    if (message !== 'CONTENT_CHECK_CART_FORM') {
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
        map(cartForm => cartForm.classList.contains('hide')) // check form element
    );

    const addToCart$ = checkCartFormElement$.pipe(
        filter(outOfStock => !outOfStock), // in stock
        switchMap(() => of(document.getElementById('addToCartSubmit'))),
        tap(addToCartButtonElement => addToCartButtonElement.click()),
        switchMap(addToCartButtonElement => fromEvent(addToCartButtonElement, 'click')),
        map(() => 'SUCCESS'),
    );

    const refreshPage$ = checkCartFormElement$.pipe(
        filter(outOfStock => outOfStock),
        map(() => 'REFRESH')
    );

    addToCart$.subscribe(res => respond(res));
    refreshPage$.subscribe(res => respond(res));

    return true;
});

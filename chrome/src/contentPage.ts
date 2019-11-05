import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

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
            map(() => 'Done!'),
        );

        const refreshPage$ = checkCartFormElement$.pipe(
            filter(isHide => isHide ? true : false),
            tap(() => chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: tabId })),
            map(() => 'Refresh!')
        );

        addToCart$.subscribe(res => respond(res));
        refreshPage$.subscribe(res => respond(res));
    } else {
        console.log(`Message: ${message}, TabId: ${tabId}`);
    }
});
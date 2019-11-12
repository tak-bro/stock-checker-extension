import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

const ALLOWED_MESSAGE = ['CONTENT_CHECK_PRODUCT_FORM', 'CONTENT_CHECK_CART_FORM'];

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        respond('request is empty');
    }

    const { tabId, message } = request;
    const isAllowedMessage = ALLOWED_MESSAGE.includes(message);
    if (!isAllowedMessage) {
        console.log(`Message: ${message}, TabId: ${tabId}`);
        respond('Unknown message from ContentPage');
    }

    // STEP 1
    if (message === 'CONTENT_CHECK_PRODUCT_FORM') {
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
            // switchMap(addToCartButtonElement => fromEvent(addToCartButtonElement, 'click')), // TODO: add clicked event listener
            map(() => 'SUCCESS'),
        );

        const refreshPage$ = checkCartFormElement$.pipe(
            filter(outOfStock => outOfStock),
            map(() => 'REFRESH')
        );

        addToCart$.subscribe(res => respond(res));
        refreshPage$.subscribe(res => respond(res));
    }

    // STEP 2
    if (message === 'CONTENT_CHECK_CART_FORM') {
        let proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
        const canProceedToCheckout$ = of(proceedToCheckoutButton).pipe(
            tap(checkoutButton => {
                if (!checkoutButton) {
                    proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
                }
            }),
            filter(button => button ? true : false),
            map((checkoutButton: any) => checkoutButton.disabled ? 'REFRESH' : 'SUCCESS')
        );

        canProceedToCheckout$.subscribe(res => respond(res));
    }

    return true;
});

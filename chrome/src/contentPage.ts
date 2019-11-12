import { of } from 'rxjs';
import { delay, filter, map, switchMap, tap } from 'rxjs/operators';

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

    const isProductMessage$ = of(message).pipe(filter(message => message === 'CONTENT_CHECK_PRODUCT_FORM'));
    const isCartMessage$ = of(message).pipe(filter(message => message === 'CONTENT_CHECK_CART_FORM'));
    const nameInProductPage$ = of(document.getElementById('productName')).pipe(map(ele => ele.innerText));
    const nameInCartPage$ = of(document.getElementsByClassName('productName')).pipe(
        map((elements: any) => elements.length > 0 ? elements[0].innerText : '')
    );

    let cartFormElement = document.getElementById('addToCartFormHolder');
    let proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');

    const checkCartFormElement$ = isProductMessage$.pipe(
        switchMap(() => of(cartFormElement)),
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
        delay(500),
        switchMap(() => nameInProductPage$),
        map(productName => `SUCCESS_${productName}`)
    );

    const refreshPage$ = checkCartFormElement$.pipe(
        filter(outOfStock => outOfStock),
        map(() => 'REFRESH')
    );

    const proceedCheckoutButton$ = isCartMessage$.pipe(
        switchMap(() => of(proceedToCheckoutButton)),
        tap(checkoutButton => {
            if (!checkoutButton) {
                proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
            }
        }),
        filter(button => button ? true : false)
    );

    const cannotProceedToCheckout$ = proceedCheckoutButton$.pipe(
        filter((checkoutButton: any) => checkoutButton.disabled),
        map(() => 'REFRESH')
    );

    const canProceedToCheckout$ = proceedCheckoutButton$.pipe(
        filter((checkoutButton: any) => !checkoutButton.disabled),
        switchMap(() => nameInCartPage$),
        map(productName => `SUCCESS_${productName}`)
    );

    // STEP 1
    addToCart$.subscribe(res => respond(res));
    refreshPage$.subscribe(res => respond(res));

    // STEP 2
    canProceedToCheckout$.subscribe(res => respond(res));
    cannotProceedToCheckout$.subscribe(res => respond(res));

    return true;
});

import { of } from 'rxjs';
import { delay, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

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
    const nameInProductPage$ = of(document.querySelector('.lv-product__title')).pipe(map((ele: any) => ele.innerText));
    const nameInCartPage$ = of(document.getElementsByClassName('productName')).pipe(
        map((elements: any) => elements.length > 0 ? elements[0].innerText : null)
    );

    // STEP 1
    let cartFormElement = document.querySelector('.lv-product-purchase__button');

    const canClickCartFormElement$ = isProductMessage$.pipe(
        delay(200),
        switchMap(() => of(cartFormElement)),
        tap(cartForm => {
            if (!cartForm) {
                cartFormElement = document.querySelector('.lv-product-purchase__button');
            }
        }),
        filter(cartForm => !!cartForm),
        filter(cartForm => cartForm.tagName.toLowerCase() === 'button'),
    );

    const cannotClickCartFormElement$ = isProductMessage$.pipe(
        delay(200),
        switchMap(() => of(cartFormElement)),
        tap(cartForm => {
            if (!cartForm) {
                cartFormElement = document.querySelector('.lv-product-purchase__button');
            }
        }),
        filter(cartForm => !!cartForm),
        filter(cartForm => cartForm.tagName.toLowerCase() === 'div'),
    );

    const addToCart$ = canClickCartFormElement$.pipe(
        switchMap(() => of(document.querySelector('.lv-product-purchase__button'))),
        tap((addToCartButtonElement: any) => addToCartButtonElement.click()),
        delay(5000),
        switchMap(() => nameInProductPage$),
        map(productName => `SUCCESS_${productName}`)
    );

    const refreshPage$ = cannotClickCartFormElement$.pipe(
        map(() => 'REFRESH')
    );

    addToCart$.subscribe(res => respond(res));
    refreshPage$.subscribe(res => respond(res));

    // TODO: refactor below
    // STEP 2
    let proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');

    const proceedCheckoutButton$ = isCartMessage$.pipe(
        switchMap(() => of(proceedToCheckoutButton)),
        tap(checkoutButton => {
            if (!checkoutButton) {
                proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
            }
        }),
        filter(button => !!button)
    );

    const cannotProceedToCheckout$ = proceedCheckoutButton$.pipe(
        withLatestFrom(nameInCartPage$),
        filter(([checkoutButton, productName]) => checkoutButton['disabled'] && productName !== null),
        map(() => 'REFRESH')
    );

    const canProceedToCheckout$ = proceedCheckoutButton$.pipe(
        withLatestFrom(nameInCartPage$),
        filter(([checkoutButton, productName]) => !checkoutButton['disabled'] && productName !== null),
        map(([_, productName]) => productName),
        map(productName => `SUCCESS_${productName}`)
    );

    const shouldLogin$ = proceedCheckoutButton$.pipe(
        switchMap(() => nameInCartPage$),
        filter(name => name === null),
        map(() => 'ERROR_SHOULD_LOGIN')
    );

    canProceedToCheckout$.subscribe(res => respond(res));
    cannotProceedToCheckout$.subscribe(res => respond(res));
    shouldLogin$.subscribe(res => respond(res));

    return true;
});

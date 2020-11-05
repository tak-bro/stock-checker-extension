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

    // const isProductMessage$ = of(message).pipe(filter(message => message === 'CONTENT_CHECK_PRODUCT_FORM'));
    // const isCartMessage$ = of(message).pipe(filter(message => message === 'CONTENT_CHECK_CART_FORM'));

    // CASE 1: PRODUCT PAGE
    let stockIndicatorElement = document.querySelector('.lv-stock-indicator');
    const isProductPage$ = of(document.querySelector('.lv-product__title')).pipe(filter(productTitle => !!productTitle));
    const nameInProductPage$ = isProductPage$.pipe(map((ele: any) => ele.innerText));

    const isInStock$ = isProductPage$.pipe(
        delay(200),
        switchMap(() => of(stockIndicatorElement)),
        tap(stockIndicator => {
            if (!stockIndicator) {
                stockIndicatorElement = document.querySelector('.lv-product-stock-indicator');
            }
        }),
        filter(stockIndicator => !!stockIndicator),
        filter(stockIndicator => stockIndicator.classList.contains('-available'))
    );

    const isNotInStock$ = isProductPage$.pipe(
        delay(200),
        switchMap(() => of(stockIndicatorElement)),
        tap(stockIndicator => {
            if (!stockIndicator) {
                stockIndicatorElement = document.querySelector('.lv-product-stock-indicator');
            }
        }),
        filter(stockIndicator => !!stockIndicator),
        filter(stockIndicator => stockIndicator.classList.contains('-not-available'))
    );

    const addToCart$ = isInStock$.pipe(
        switchMap(() => of(document.querySelector('.lv-product-purchase__button'))),
        tap((addToCartButtonElement: any) => addToCartButtonElement.click()),
        delay(500),
        switchMap(() => nameInProductPage$),
        map(productName => `SUCCESS_PRODUCT_${productName}`)
    );

    const refreshPage$ = isNotInStock$.pipe(map(() => 'REFRESH'));

    addToCart$.subscribe(res => respond(res));
    refreshPage$.subscribe(res => respond(res));

    // CASE 2: CART PAGE
    let proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
    const isCartPage$ = of(document.getElementById('titleMyShoppingBag')).pipe(filter(element => !!element));
    const nameInCartPage$ = of(document.getElementsByClassName('productName')).pipe(map((elements: any) => elements.length > 0 ? elements[0].innerText : null));

    const proceedCheckoutButton$ = isCartPage$.pipe(
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
        map(productName => `SUCCESS_CART_${productName}`)
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

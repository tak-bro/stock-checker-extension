import { of } from 'rxjs';
import { throwError } from 'rxjs/internal/observable/throwError';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (!request) {
        throwError('request is empty');
    }

    const { tabId, message } = request;
    if (message === 'CHECK_CART_FORM') {
        // check form element
        const cartFormElement = document.getElementById('addToCartFormHolder');
        const addToCartButtonElement = document.getElementById('addToCartSubmit');
        const isHideCartForm = cartFormElement.classList.contains('hide');

        const addToCart$ = of(isHideCartForm).pipe(
            filter(isHide => isHide ? false : true),
            tap(() => addToCartButtonElement.click()),
            switchMap(() => fromEvent(addToCartButtonElement, 'click')),
            take(1),
            map(() => 'Done!'),
        );

        const refreshPage$ = of(isHideCartForm).pipe(
            filter(isHide => isHide ? true : false),
            tap(() => {
                chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: tabId });
            }),
            map(() => 'Refresh!')
        );

        addToCart$.subscribe(res => {
            respond(res);
        });

        refreshPage$.subscribe(res => {
            respond(res);
        });
    } else if (message === 'STOP_REFRESH') {
        // do nothing
    }

});
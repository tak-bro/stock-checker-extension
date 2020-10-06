import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { SlackService } from './services/slack.service';
import { Subject } from 'rxjs';

import { TAB_ID } from './tab-id.injector';
import { distinctUntilChanged, filter, mapTo, scan } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { merge } from 'rxjs/internal/observable/merge';

const DELAY_MIN = 10;
const DELAY_MAX = 1000;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    @ViewChild('plusButton') plusButton: ElementRef;
    @ViewChild('minusButton') minusButton: ElementRef;

    private readonly message = new Subject<string>();
    private readonly currentTabId = this.tabId;
    private readonly message$ = this.message.asObservable();
    private checkType = '';
    isPossible = false;
    isInit = true;
    refreshDelay = 5;

    constructor(@Inject(TAB_ID) private readonly tabId: number,
                private slackService: SlackService) {}

    ngAfterViewInit() {
        this.checkResponseFromEvent(); // 백그라운드에서 체크하면 결제할 때 리프레시할 수도 있음
        this.checkPlusMinusButtonStream();
    }

    checkInProduct() {
        this.setInitData('PRODUCT');
        this.sendCheckInProductMessage();
    }

    checkInCart() {
        this.setInitData('CART');
        this.sendCheckInCartMessage();
    }

    private setInitData(type: string) {
        this.isInit = false;
        this.isPossible = true;
        this.checkType = type;
    }

    private checkPlusMinusButtonStream() {
        const minus$ = fromEvent(this.minusButton.nativeElement, 'click').pipe(mapTo(-10));
        const plus$ = fromEvent(this.plusButton.nativeElement, 'click').pipe(mapTo(10));
        const plusAndMinusStream$ = merge(plus$, minus$).pipe(
            scan((acc, curr) => Math.max(Math.min(acc + curr, DELAY_MAX), DELAY_MIN), this.refreshDelay),
            distinctUntilChanged(),
        );

        plusAndMinusStream$.subscribe(delay => {
            this.refreshDelay = delay;
        });
    }

    private checkResponseFromEvent() {
        const validMessage$ = this.message$.pipe(
            filter(() => this.isPossible),
            filter(message => !!message),
        );

        validMessage$.subscribe(message => {
            this.manageResponseMessage(message);
            console.log(`Message: ${message}`);
        });
    }

    private manageResponseMessage(text: string) {
        const [message, ...productOrError] = text.split('_');
        switch (message) {
            case 'ERROR':
                const errorMessage = productOrError.join('_');
                this.doReportError(errorMessage);
                break;
            case 'REFRESH':
                this.sendRefreshMessage();
                break;
            case 'SUCCESS':
                const productName = productOrError.join('_');
                this.sendSuccessMessage(productName);
                break;
            case 'RELOADED':
            default:
                setTimeout(() => this.sendInitialMessage(), this.refreshDelay * 1000);
                break;
        }
        return;
    }

    private sendInitialMessage() {
        switch (this.checkType) {
            case 'CART':
                this.sendCheckInCartMessage();
                break;
            case 'PRODUCT':
            default:
                this.sendCheckInProductMessage();
                break;
        }
        return;
    }

    private sendCheckInProductMessage() {
        chrome.runtime.sendMessage({ message: 'CHECK_IN_PRODUCT', tabId: this.currentTabId }, this.setMessage$);
    }

    private sendCheckInCartMessage() {
        chrome.runtime.sendMessage({ message: 'CHECK_IN_CART', tabId: this.currentTabId }, this.setMessage$);
    }

    private sendSuccessMessage(productName: string) {
        // send to slack
        this.slackService.postToSlack(this.checkType, productName);
        // to log on backgroundPage
        chrome.runtime.sendMessage({ message: 'ITEM_IN_STOCK', tabId: this.currentTabId }, this.setMessage$);
    }

    private sendRefreshMessage() {
        chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: this.currentTabId }, this.setMessage$);
    }

    private doReportError(message: string) {
        this.slackService.reportError(message); // do nothing after sending error
    }

    private setMessage$ = response => this.message.next(response);
}

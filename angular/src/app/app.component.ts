import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { TAB_ID } from './tab-id.injector';
import { distinctUntilChanged, filter, mapTo, scan } from 'rxjs/operators';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { merge } from 'rxjs/internal/observable/merge';

const DELAY_MIN = 1;
const DELAY_MAX = 30;

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
    isPossible = false;
    isInit = true;
    refreshDelay = 5;

    constructor(@Inject(TAB_ID) private readonly tabId: number) {}

    ngAfterViewInit() {
        const validMessage$ = this.message$.pipe(
            filter(() => this.isPossible),
            filter(message => message ? true : false),
        );

        // check response from event
        validMessage$.subscribe(message => {
            this.manageResponseMessage(message);
            console.log(`Message: ${message}`);
        });

        // check plus, minus button stream
        const minus$ = fromEvent(this.minusButton.nativeElement, 'click').pipe(mapTo(-1));
        const plus$ = fromEvent(this.plusButton.nativeElement, 'click').pipe(mapTo(1));
        const plusAndMinusStream$ = merge(plus$, minus$).pipe(
            scan((acc, curr) => Math.max(Math.min(acc + curr, DELAY_MAX), DELAY_MIN), this.refreshDelay),
            distinctUntilChanged(),
        );

        plusAndMinusStream$.subscribe(delay => {
            this.refreshDelay = delay;
        });
    }

    onStart() {
        this.isInit = false;
        this.isPossible = true;
        this.checkInitialPage();
    }

    private manageResponseMessage(message: string) {
        switch (message) {
            case 'REFRESH':
                this.refreshPage();
                break;
            case 'SUCCESS':
                this.sendSuccessMessage();
                break;
            case 'RELOADED':
            default:
                setTimeout(() => this.checkInitialPage(), this.refreshDelay * 1000);
                break;
        }
    }

    private sendSuccessMessage() {
        // to log on backgroundPage
        chrome.runtime.sendMessage({ message: 'SUCCESS_TO_ADD', tabId: this.currentTabId });
    }

    private refreshPage() {
        chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: this.currentTabId }, response => {
            this.message.next(response);
        });
    }

    private checkInitialPage() {
        chrome.runtime.sendMessage({ message: 'INITIAL_LOAD', tabId: this.currentTabId }, response => {
            this.message.next(response);
        });
    }

}

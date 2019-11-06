import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { TAB_ID } from './tab-id.injector';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    private readonly message = new Subject<string>();
    private readonly currentTabId = this.tabId;
    private readonly message$ = this.message.asObservable();
    private count = 0;
    isPossible = false;

    constructor(@Inject(TAB_ID) private readonly tabId: number) {}

    ngOnInit() {
        const validMessage$ = this.message$.pipe(
            filter(() => this.isPossible),
            filter(message => message ? true : false),
        );

        // check response from event
        validMessage$.subscribe(message => {
            this.manageResponseMessage(message);
            this.setLog(message);
        });
    }

    onStart() {
        this.isPossible = true;
        this.checkInitialPage();
    }

    onStop() {
        this.isPossible = false;
    }

    private manageResponseMessage(message: string) {
        switch (message) {
            case 'REFRESH':
                this.refreshPage();
                break;
            case 'RELOADED':
            default:
                this.checkInitialPage();
                break;
        }
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

    private setLog(message: string) {
        this.count = this.count + 1;
        console.log(`Message: ${message} - ${this.count}`);
    }
}

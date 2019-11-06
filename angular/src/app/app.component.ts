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
        this.message$.pipe(filter(() => this.isPossible)).subscribe(message => {
            switch (message) {
                case 'DONE':
                    alert('Added to cart!');
                    this.isPossible = !this.isPossible;
                    break;
                case 'REFRESH':
                    chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: this.currentTabId }, response => {
                        this.message.next(response);
                    });
                    break;
                case 'RELOADED':
                default:
                    chrome.runtime.sendMessage({ message: 'INITIAL_LOAD', tabId: this.currentTabId }, response => {
                        this.message.next(response);
                    });
                    break;
            }

            this.count = this.count + 1;
            console.log(`Message: ${message} - ${this.count}`);
        });
    }

    onStart() {
        this.isPossible = !this.isPossible;
        chrome.runtime.sendMessage({ message: 'INITIAL_LOAD', tabId: this.currentTabId }, response => {
            this.message.next(response);
        });
    }

    onStop() {
        alert('Stopped!'); // TODO: add stopped
        this.isPossible = !this.isPossible;
    }
}

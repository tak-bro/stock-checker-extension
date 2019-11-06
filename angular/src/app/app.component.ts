import {ChangeDetectorRef, Component, Inject, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { Subject } from 'rxjs';
import {filter, tap} from 'rxjs/operators';

import { TAB_ID } from './tab-id.injector';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    private readonly message = new Subject<string>();
    private readonly currentTabId = this.tabId;
    private readonly message$ = this.message.asObservable();

    constructor(@Inject(TAB_ID) private readonly tabId: number) {}

    ngOnInit() {
        this.message$.pipe(filter(res => res ? true : false)).subscribe(message => {
            console.log('message: ', message);

            switch (message) {
                case 'DONE':
                    alert('Added to cart!');
                    break;
                case 'REFRESH':
                    chrome.runtime.sendMessage({ message: 'REFRESH_PAGE', tabId: this.currentTabId }, response => {
                        this.message.next(response);
                    });
                    break;
                case 'RELOADED':
                    chrome.runtime.sendMessage({ message: 'INITIAL_LOAD', tabId: this.currentTabId }, response => {
                        this.message.next(response);
                    });
                    break;
                case 'STOP':
                    alert('Stopped!'); // TODO: add stopped
                    break;
            }
        });
    }

    onStart() {
        chrome.runtime.sendMessage({ message: 'INITIAL_LOAD', tabId: this.currentTabId }, response => {
            this.message.next(response);
        });
    }

    onStop() {
        this.message.next('STOP');
    }
}

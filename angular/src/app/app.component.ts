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
  private readonly _message = new Subject<string>();

  readonly tabId = this._tabId;
  readonly message$ = this._message.asObservable().pipe(
    tap(() => setTimeout(() => this._changeDetector.detectChanges()))
  );

  constructor(@Inject(TAB_ID) private readonly _tabId: number,
              private readonly _changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.message$.pipe(filter(res => res ? true : false)).subscribe(message => {
      console.log(message);
      // if (message === 'RELOADED') {
      //   chrome.tabs.sendMessage(this.tabId, { message: 'CHECK_CART_FORM', tabId: this.tabId }, response => {
      //     this._message.next(response);
      //   });
      // }
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: 'CHECK_CART_FORM_', tabId: this.tabId }, function(response) {
          console.log(`message from background: ${JSON.stringify(response)}`);
        });
      });
    })
  }

  onStart() {
    chrome.tabs.sendMessage(this.tabId, { message: 'CHECK_CART_FORM', tabId: this.tabId }, response => {
      this._message.next(response);
    });
  }

  onStop() {
    this._message.next('stop');
  }
}

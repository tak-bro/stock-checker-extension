import {ChangeDetectorRef, Component, Inject, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { Subject } from 'rxjs';
import {filter, tap} from 'rxjs/operators';

import { TAB_ID } from './tab-id.injector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly _message = new Subject<string>();

  readonly tabId = this._tabId;
  readonly message$ = this._message.asObservable().pipe(
    tap(() => setTimeout(() => this._changeDetector.detectChanges()))
  );

  constructor(@Inject(TAB_ID) private readonly _tabId: number,
              private readonly _changeDetector: ChangeDetectorRef) {}

  onStart() {
    chrome.tabs.sendMessage(this.tabId, { message: 'CHECK_CART_FORM', tabId: this.tabId }, response => {
      this._message.next(chrome.runtime.lastError ? 'Error!' : response);
    });
  }

  onStop() {
    chrome.tabs.sendMessage(this.tabId, { message: 'STOP_REFRESH', tabId: this.tabId }, response => {
      this._message.next(chrome.runtime.lastError ? 'Error!' : response);
    });
  }
}

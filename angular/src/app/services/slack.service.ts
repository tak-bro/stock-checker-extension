import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SlackService {

    private readonly SUJI_ETC_WEBHOOK = 'https://hooks.slack.com/services/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';
    private readonly TAK_ID = 'UNYNZKXDX';
    private readonly options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

    constructor(private http: HttpClient) { }

    postToSlack(): void {
        const message = {
            text: `LouisVuitton Item In Stock! <@${this.TAK_ID}>`,
        };
        this.http.post(this.SUJI_ETC_WEBHOOK, message, this.options).subscribe();
    }
}

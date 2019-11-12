import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SlackService {

    private readonly WEBHOOK_URL = 'https://hooks.slack.com/services/.../.../...';
    private readonly USER_ID = '...';
    private readonly options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

    constructor(private http: HttpClient) { }

    postToSlack(type: string, productName: string) {
        const text = (type === 'PRODUCT')
            ? `STEP1 - ${productName} In Stock! <@${this.USER_ID}>`
            : `STEP2 - ${productName} Can Proceed To Checkout! <@${this.USER_ID}>`;

        const message = { text };
        this.http.post(this.WEBHOOK_URL, message, this.options).subscribe();
    }
}

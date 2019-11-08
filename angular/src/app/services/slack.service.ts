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

    postToSlack(): void {
        const message = {
            text: `LouisVuitton Item In Stock! <@${this.USER_ID}>`,
        };
        this.http.post(this.WEBHOOK_URL, message, this.options).subscribe();
    }
}

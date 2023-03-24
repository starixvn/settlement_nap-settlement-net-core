import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KickOut } from '../models';

@Injectable()
export class ReCheckInService {
    private readonly httpClient: HttpClient;
    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }
    public reCheckin() {
        const urlRecheckIn = "/Auth/ReCheckIn";
        const urlLogout =  "/Auth/LogOut";
        const urlOffline = "/Auth/Offline";
        const headers = new HttpHeaders(
            {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            });
        const options = { headers };
        this.httpClient.post(urlRecheckIn, null, options)
        .subscribe(
            (response: KickOut) => {
                if (response.IsKickedOut === 1) {
                    alert('You have logged in from another session or your login session has expired!');
                    window.location.href = urlLogout;
                }

            },
            (error) => {
                if (error.error.code === 999999) {
                    window.location.href = urlOffline;
                }
            });
    }
}
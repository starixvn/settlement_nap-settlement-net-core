import { BlockUIService } from './block-ui.service';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Language } from '../language';
import { MessageBoxService } from './message-box.service.native';
import { ModalDialogMessage } from '../models/modal-dialog-message.model';
import { decodeAsync } from '@msgpack/msgpack';

@Injectable()
export class HttpRequestService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly blockUIService: BlockUIService,
        private readonly messageBoxService: MessageBoxService) {
    }

    public postJson<T>(object: object, url: string, blockUI = true): Observable<T> {
        this.blockUIService.startBlock(blockUI);
        const body = JSON.stringify(object);
        const headers = new HttpHeaders(
            {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            });
        const options = { headers };

        return this.httpClient.post(url, body, options)
            .pipe(map((response) => blockUI ? this.parseResponse(response) : response),
                catchError((error) => blockUI ? this.handleError(error) : of([])));
    }

    public postMessagePack<T>(object: object, url: string, blockUI = true): Observable<T> {
        this.blockUIService.startBlock(blockUI);
        const body = JSON.stringify(object)

        const headers = new HttpHeaders({
            'Content-Type': 'application/json;charset=UTF-8',
            accept: 'application/x-msgpack',
        })

        return this.httpClient
            .post(url, body, { headers: headers, responseType: 'blob' })
            .pipe(mergeMap(async (blob) => {
                if (blockUI) {
                    this.blockUIService.stopBlock();
                }

                return await decodeAsync(blob.stream()) as T;
            }))
    }

    public getJson<T>(url: string): Observable<T> {
        return this.httpClient.get(url)
            .pipe(map((response: Response) => this.parseResponse(response)),
                catchError((error) => this.handleError(error)));
    }

    private parseResponse(response) {
        this.blockUIService.stopBlock();
        return response;
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 403) {
            alert(error.error);
            window.parent.location.href = "Auth/LogOut";
        }
        else {
            const modalDialogMessage = new ModalDialogMessage();
            modalDialogMessage.title = Language.SystemError;
            modalDialogMessage.message = Language.SystemErrorMessage;
            this.messageBoxService.alert(modalDialogMessage);
        }

        return throwError(error);
    }

    public getUrlParameter(value: string) {
        const sPageURL = window.location.search.substring(1);
        const sURLVariables = sPageURL.split('&');
        for (const param of sURLVariables) {
            const name = param.split('=');
            if (name[0] === value) {
                return name[1];
            }
        }

        return "";
    }
}
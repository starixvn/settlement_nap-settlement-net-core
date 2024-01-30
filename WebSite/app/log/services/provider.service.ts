import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { ItemsSelect } from './../../shared/models';
import { ProviderName, ProviderFilter } from '../models';

@Injectable()
export class ProviderService {
    private readonly httpRequestService: HttpRequestService;

    constructor(httpRequestService: HttpRequestService) {
        this.httpRequestService = httpRequestService;
    }

    public getProviderName() {
        const url = `/api/log/get-provider-name`;
        return this.httpRequestService.getJson(url);
    }

    public renderProviderName(options: ProviderName[]) {
        const items = new Array<ItemsSelect>();

        options.forEach((item: ProviderName) => {
            const provider = new ItemsSelect(
                item.sourceId,
                item.sourceId.toString(),
                item.sourceName,
                true,
                true,
                true,
                []);
            items.push(provider);
        });

        return items;
    }

    public search(query: ProviderFilter) {
        return this.httpRequestService.postJson(query, `/api/log/get-provider-result`);
    }
}
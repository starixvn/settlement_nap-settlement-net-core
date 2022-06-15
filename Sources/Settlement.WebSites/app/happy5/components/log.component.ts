import { Component, Input, OnInit } from "@angular/core";
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { MatchDetail } from '../models';
@Component({
    selector: 'log',
    templateUrl: './log.component.html',
})

export class LogComponent implements OnInit {
    @Input() public match: MatchDetail;
    @Input() public fromDate: string;
    @Input() public toDate: string;
    public url: SafeResourceUrl;

    constructor(private readonly domSanitizer: DomSanitizer) {
    }

    public ngOnInit() {
        const link = `home/log/?matchCode=${this.match.matchCode}&fromDate=${this.fromDate}&toDate=${this.toDate}&isShowMenu=false&productType=HPF`;
        this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(link);
    }
}
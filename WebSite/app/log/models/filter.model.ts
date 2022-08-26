import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
export class Filter {
    public matchCode: string;
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public productType: string;
}
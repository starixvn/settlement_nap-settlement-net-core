import {Component, Input, TemplateRef} from "@angular/core";
import {CommonModule, NgStyle} from "@angular/common";


@Component({
    selector: "app-table",
    templateUrl: "./app-table.component.html",
    styleUrls: ["./table.component.scss"],
    standalone: true,
    imports: [CommonModule],

})
export class AppTableComponent<T> {
    @Input() tableHeaders: string[] = [];
    @Input() tableData: T[] = [];
    @Input() maxHeight = '400px';
    @Input() rowTemplate!: TemplateRef<T>;
}
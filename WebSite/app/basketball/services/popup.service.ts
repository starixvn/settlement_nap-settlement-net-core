import { inject } from "@angular/core";
import { DialogBoxService } from "../../shared/services";


export class PopupService {
  private readonly dialogBoxService = inject(DialogBoxService);
}     
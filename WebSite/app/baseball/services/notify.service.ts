import { inject, Injectable } from "@angular/core";
import { ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language.native";
import { MessageBoxService } from "../../shared/services";
import { ToastrService } from 'ngx-toastr';

@Injectable(
  { providedIn: 'root' }
)

export class NotifyService {
  private messageBoxService = inject(MessageBoxService);
  private toastrService = inject(ToastrService);
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage(Language.confirmationBox);


  confirm(message: string, confirmCallback: () => void, hasActionOnNoBtn = false, rejectCallback?: () => void) {
    this.confirmationDialogMessage.message = message;
    this.confirmationDialogMessage.hasActionOnNoBtn = hasActionOnNoBtn;
    this.messageBoxService.confirm(this.confirmationDialogMessage, confirmCallback, rejectCallback);
  }

  clearError() {
    this.toastrService.clear();
  }

  error(message: string) {
    this.toastrService.error(message);
  }

  closePopup() {
    this.messageBoxService.closePopup()
  }
}
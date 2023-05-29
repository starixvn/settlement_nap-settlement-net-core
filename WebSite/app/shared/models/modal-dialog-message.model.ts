export class ModalDialogMessage {
    public title: string;
    public message: string;
    public yes: string;
    public hideNo = false;
    public hasActionOnNoBtn = false;

    constructor(title: string = "") {
        this.title = title;
    }
}
export class DialogDataIframe {
  public title: string;
  public src: string;
  public class: string;
  constructor(title: string, content: string) {
    this.title = title;
    this.src = content;
    this.class = '';
  }
}
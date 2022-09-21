export class ItemsSelect {
    public id: number;
    public value: string;
    public text: string;
    public checked: boolean;
    public expanded: boolean;
    public enable: boolean;
    public items: ItemsSelect[];
    public type: string;
    public countChilds: number;
    public isShow: boolean;

    constructor(
        id: number,
        value: string,
        text: string,
        checked: boolean,
        expanded: boolean,
        enable: boolean,
        items: ItemsSelect[],
        ) {
        this.id = id;
        this.value = value;
        this.text = text;
        this.checked = checked;
        this.expanded = expanded;
        this.enable = enable;
        this.items = items;
        this.countChilds = 0;
        this.countChilds = this.getCountChilds();
        this.isShow = true;
    }

    public expandedAllItems() {
        this.expanded = true;
        this.items.forEach((item) => {
            item.expandedAllItems();
        });
    }

    public getCountChilds() {
        if (this.items.length === 0) {
            this.countChilds = 1;
        }

        this.items.forEach((item) => {
            this.countChilds += item.countChilds;
        });

        return this.countChilds;
    }

    public checkChilds() {
        this.items.forEach((item) => {
            item.checked = item.enable ? this.checked : item.checked;
            item.checkChilds();
        });
    }

    public checkFromChilds() {
        this.checked = this.allChildIsChecked();
        this.items.forEach((item) => {
            item.checkFromChilds();
        });
    }

    public allChildIsChecked() {
        return this.countChilds === this.countChildsChecked();
    }

    public countChildsChecked() {
        let count = 0;
        if (this.items.length === 0) {
            count = this.checked ? 1 : 0;
        }
        this.items.forEach((item) => {
            count += item.countChildsChecked();
        });

        return count;
    }

    public getValueChildsChecked() {
        let values = '';
        if (this.items.length === 0) {
            values = this.checked ? this.value : '';
        }

        this.items.forEach((item) => {
            const value = item.getValueChildsChecked();
            if (value !== '') {
                values = values === '' ? value : `${values},${value}`;
            }
        });

        return values;
    }

    public getTextChildsChecked() {
        let text = '';
        if (this.items.length === 0) {
            text = this.checked ? this.text : '';
        }

        this.items.forEach((item) => {
            const textItem = item.getTextChildsChecked();
            if (textItem !== '') {
                text = text === '' ? textItem : `${text},${textItem}`;
            }
        });

        return text;
    }
}
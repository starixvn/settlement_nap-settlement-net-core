export class UrlHelper {
    public static getUrlParameter(value: string) {
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
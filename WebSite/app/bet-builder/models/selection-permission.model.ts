import { Permission } from './permission.model';
import { Selection } from './selection.model';

export class SelectionPermission {
    public permission: Permission;
    public selectionDetail: Selection[];
}
import { Store } from 'flux/utils';

import AccountConstants from '../constants/Account';
import AppDispatcher from '../dispatchers/AppDispatcher';
import CategoryConstants from '../constants/Category';


class CategoryStore extends Store {

    constructor(dispatcher) {
        super(dispatcher);
        this._categories = null;
    }

    __onDispatch(action) {
        switch(action.type) {
            case CategoryConstants.CATEGORIES_PROCESS:
                this._categories = action.categories;
                this.__emitChange();
                break;
            case AccountConstants.LOGOUT_PROCESS:
                this._categories = null;
                this.__emitChange();
                break;
            default:
                break;
        }
    }

    get categories() {
        return this._categories;
    }
}

export default new CategoryStore(AppDispatcher);

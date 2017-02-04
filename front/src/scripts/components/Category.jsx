import React from 'react';

import CategoryActions from '../actions/Category';
import CategoryStore from '../stores/Category';


function getCategoryState() {
    return {
        categories: CategoryStore.categories
    };
}

export default class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = getCategoryState();
        this._onChange = this._onChange.bind(this);
    }

    componentDidMount() {
        if (this.state.categories === null) {
            CategoryActions.load();
        }

        this.subscription = CategoryStore.addListener(this._onChange.bind(this));
    }

    componentWillUnmount() {
        this.subscription.remove()
    }

    _onChange() {
        this.setState(getCategoryState());
    }

    render() {
        return (
            <div>
                <h1>{this.state.categories}</h1>
            </div>
        );
    }
};

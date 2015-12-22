import React from 'react';

import CategoryStore from '../stores/Category.js';


export default class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getQuoteState();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    if (!this.state.quote) {
      this.requestNextQuote();
    }

    QuoteStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    QuoteStore.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(this.getQuoteState());
  }

  requestNextQuote() {
    QuoteService.nextQuote();
  }

  getQuoteState() {
    return {
      quote: QuoteStore.quote
    };
  }

  render() {
    return (
      <div>
        <h1>{this.state.quote}</h1>
        <button className="btn btn-primary" type="button" onClick={this.requestNextQuote}>Next Quote</button>
      </div>
    );
  }
};

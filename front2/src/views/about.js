import React from 'react';
import {Link} from 'react-router';

export default class AboutView extends React.Component {

    render () {
        return (
            <article>
                <h1>Hello </h1>
                <p>It is web app for prioritization
                  <Link to='/protected'>protected content.</Link>
                </p>
            </article>
        );
    }

}

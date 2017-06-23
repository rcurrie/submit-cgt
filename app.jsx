import React from 'react';
import ReactDOM from 'react-dom';

import convert from 'xml-js';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      genomic: {},
    };
  }

  componentDidMount() {
    fetch('samples/genomic.xml')
      .then(response => response.text())
      .then(xml => convert.xml2js(xml, { compact: true }))
      .then(genomic => this.setState({ genomic }))
      .catch(error => console.log(error));
  }

  render() {
    return <h1>Hello</h1>;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

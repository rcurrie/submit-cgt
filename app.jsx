import React from 'react';
import ReactDOM from 'react-dom';

import convert from 'xml-js';

import Genomic from './genomic';


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
      .then(report => report['rr:ResultsReport']['rr:ResultsPayload']['variant-report'])
      .then(genomic => this.setState({ genomic }))
      .catch(error => console.log(error));
  }

  render() {
    return (
      <Genomic genomic={this.state.genomic} />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

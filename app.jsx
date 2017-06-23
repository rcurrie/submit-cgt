import convert from 'xml-js';
import XLSX from 'xlsx';

import React from 'react';
import ReactDOM from 'react-dom';

import Genomic from './genomic';
import Clinical from './clinical';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clinical: {},
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

    fetch('samples/clinical.xlsx')
      .then(response => response.blob())
      .then(excel => XLSX.read(excel))
      .then(workbook => console.log(workbook))
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div>
        <Clinical clinical={this.state.clinical} />
        <Genomic genomic={this.state.genomic} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

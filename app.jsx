import convert from 'xml-js';
import XLSX from 'xlsx';

import React from 'react';
import ReactDOM from 'react-dom';

import PromiseFileReader from 'promise-file-reader';
import Dropzone from 'react-dropzone';

import Genomic from './genomic';
import Clinical from './clinical';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clinical: {},
      clinicalFilter: {},
      genomic: {},
    };
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount() {
    fetch('clinicalFilter.tsv')
      .then(response => response.text())
      .then(tsv => tsv.split('\n').map(line => line.split('\t')))
      .then(array => array.reduce((obj, item) => {
        Object.assign(obj, { [item[0]]: item[2] }); return obj;
      }, {}))
      .then(clinicalFilter => this.setState({ clinicalFilter }))
      .catch(error => console.log(error));
  }

  onDrop(files) {
    console.log(files);
    console.log(this.props);
    // this.setState({ files });
    files.forEach((file) => {
      console.log(this);
      const reader = new FileReader();
      reader.onload = () => {
        // console.log(reader.result);
        console.log('read another file');
      };
      if (file.name.endsWith('xlsx')) {
        console.log('Reading xlsx');
        PromiseFileReader.readAsArrayBuffer(file)
          .then((arrayBuffer) => {
            const data = new Uint8Array(arrayBuffer);
            const binaryString = data.reduce((acc, cur) => acc + String.fromCharCode(cur), '');
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const clinical = XLSX.utils.sheet_to_json(sheet, { range: 'A6:IQ7' })[0];
            console.log(clinical);
            console.log(this);
            this.setState({ clinical });
          })
          .catch(error => console.log(error));
      } else if (file.name.endsWith('xml')) {
        console.log('Reading xml');
        PromiseFileReader.readAsText(file)
          .then(xml => convert.xml2js(xml, { compact: true }))
          .then(report => report['rr:ResultsReport']['rr:ResultsPayload']['variant-report'])
          .then(genomic => this.setState({ genomic }))
          .catch(error => console.log(error));
      } else {
				/*eslint no-alert: "noerror"*/
        window.alert('Unknown file type, must be clinical .xlsx or genomic .xml');
      }
    });
  }

  render() {
    console.log('Rendering...');
    const filtered = Object.keys(this.state.clinical)
      .filter(key => this.state.clinicalFilter[key] !== '')
      .reduce((obj, key) => { obj[key] = this.state.clinical[key]; return obj; }, {});

    return (
      <div>
        <a href="http://www.cancergenetrust.org">
          <img
            alt="Cancer Gene Trust Logo"
            src="images/logo_with_name.png"
            style={{ padding: '8px', height: '64px' }}
            className="center-block img-responsive"
          />
        </a>
        <Dropzone
          onDrop={this.onDrop}
          style={{ height: '100%', width: '100%' }}
          activeStyle={{ backgroundColor: 'rgba(0, 255, 0, .5)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <h4>Drag and drop files onto the page, or click to select files.</h4>
          </div>
          <Clinical clinical={filtered} />
          <Genomic genomic={this.state.genomic} />
        </Dropzone>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

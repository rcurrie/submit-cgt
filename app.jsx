import convert from 'xml-js';
import XLSX from 'xlsx';

import React from 'react';
import ReactDOM from 'react-dom';

import PromiseFileReader from 'promise-file-reader';
import Dropzone from 'react-dropzone';
import saveAs from 'save-as';

import Genomic from './genomic';
import Clinical from './clinical';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: '123',
      clinical: {},
      clinicalFilter: {},
      clinicalFiltered: {},
      genomic: {},
      dateFirstContact: null,
    };
    this.onDrop = this.onDrop.bind(this);
    this.onChange = this.onChange.bind(this);
    this.export = this.export.bind(this);
  }

  dateToYear(d) {
    return new Date(d).getFullYear().toString();
  }

  daysFromFirstContact(d) {
    console.log("date:", d);
    return this.state.dateFirstContact && d && d !== '00/00/0000' ? 
      Math.round(Math.abs((new Date(d).getTime() - this.state.dateFirstContact.getTime())
        /(24*60*60*1000))).toString() : "";
  }

  parseCNExTFile(file) {
    console.log('Parsing CNExT XLSX Clinical File');
    PromiseFileReader.readAsArrayBuffer(file)
      .then((arrayBuffer) => {
        const data = new Uint8Array(arrayBuffer);
        const binaryString = data.reduce((acc, cur) => acc + String.fromCharCode(cur), '');
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (sheet.B12.v != 'CNExT Software') {
          window.alert('Clinical xlsx does not appear to be exported from CNExT');
          return;
        }
        const clinical = XLSX.utils.sheet_to_json(sheet, { range: 'A6:IQ7' })[0];
        this.setState({ clinical });

        const dateFirstContact = new Date(clinical["Date First Contact"]);
        this.setState({ dateFirstContact });
        clinical["Date First Contact"] = this.dateToYear(dateFirstContact);

        const clinicalFiltered = Object.keys(this.state.clinicalFilter)
          .reduce((obj, key) => { obj[this.state.clinicalFilter[key].cgt] 
              = this.state.clinicalFilter[key].transform ?
                this.daysFromFirstContact(this.state.clinical[key])
                : this.state.clinical[key]; return obj; }, {});
        this.setState({ clinicalFiltered });
      })
      .catch(error => console.log(error));
  }

  parseFoundationOne(file) {
    console.log('Parsing FoundationOne XML Genomics File');
    PromiseFileReader.readAsText(file)
      .then((text) => {
        if (!text.includes("FoundationOne")) {
          throw new Error('Illegal argument: ');
        }
        return text;
      })
      .then(xml => convert.xml2js(xml, { compact: true }))
      .then(report => report['rr:ResultsReport']['rr:ResultsPayload']['variant-report'])
      .then(genomic => this.setState({ genomic }))
      .catch(error => console.log(error));
  }

  onDrop(files) {
    files.forEach((file) => {
      const reader = new FileReader();
      if (file.name.endsWith('xlsx')) {
        this.parseCNExTFile(file);
      } else if (file.name.endsWith('xml')) {
        this.parseFoundationOne(file);
      } else {
				/*eslint no-alert: "noerror"*/
        window.alert('Unknown file type, must be clinical .xlsx or genomic .xml');
      }
    });
  }

  componentDidMount() {
    fetch('clinicalFilter.tsv')
      .then(response => response.text())
      .then(tsv => tsv.split('\n').slice(1))
      .then(lines => lines.map(line => line.split('\t')))
      .then(array => array.filter(line => line[2] != ''))
      .then(array => array.reduce((obj, item) => {
        Object.assign(obj, { [item[0]]: {'cgt': item[2], 'transform': item[3]} }); return obj;
      }, {}))
      .then(clinicalFilter => this.setState({ clinicalFilter }))
      .catch(error => console.log(error));

    // When debugging auto-load sample files
    if (window.location.hostname == "localhost") {
      fetch('samples/clinical.xlsx')
        .then(file => file.blob())
        .then(blob => this.parseCNExTFile(blob))
        .catch(error => console.log(error));
      fetch('samples/genomic.xml')
        .then(file => file.blob())
        .then(blob => this.parseFoundationOne(blob))
        .catch(error => console.log(error));
    }
  }

  onChange(event) {
    this.setState({patientId: event.target.value});
  }

  export() {
    const submission = new Blob([JSON.stringify({
      patientId: this.state.patientId,
      clinical: this.state.clinicalFiltered,
      genomic: this.state.genomic,
    }, null, '\t')], {type: "application/json"});
    saveAs(submission, this.state.patientId);
	}

  render() {
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
				<div className="input-group">
					<span className="input-group-addon" id="patient-id">Public Random Participant ID</span>
					<input type="text" className="form-control"
                 value={this.state.patientId} onChange={this.onChange}
					       aria-describedby="patient-id"></input>
            <span className="input-group-btn">
              <button className="btn btn-default" type="button" onClick={this.export}>Export</button>
            </span>
				</div>
        <Dropzone onDrop={this.onDrop}
            style={{"width" : "100%", "height" : "100%", "border" : "2px dashed black"}}>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <p>Drag and drop files, or click for a file dialog to import.</p>
          </div>
					<Clinical clinical={this.state.clinicalFiltered} />
					<Genomic genomic={this.state.genomic} />
        </Dropzone>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

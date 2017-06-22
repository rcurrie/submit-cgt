import React from 'react';
import ReactDOM from 'react-dom';

export default class XMLTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      xml: this.props.xml || (new DOMParser()).parseFromString('', 'text/xml'),
    };
  }

  render() {
    if (this.state.xml) {
      return (
        <div>
          {Array.from(this.state.xml.childNodes).map((child, index) => (
            <div key={index}>
              <span>nodeName {child.nodeName}</span>
              <span>innerText {child.innerText}</span>
              <span>textContent {child.textContent}</span>
              <span>nodeValue {child.nodeValue}</span>
              {<XMLTree xml={child} />}
            </div>
          ))}
        </div>
      );
    }
    return (<div>Empty</div>);
  }
}

fetch('samples/genomic.xml')
  .then(response => response.text())
  .then(text => (new DOMParser()).parseFromString(text, 'text/xml'))
  .then(xml => xml.querySelector('variant-report'))
  .then(filteredXML => ReactDOM.render(<XMLTree xml={filteredXML} />, document.getElementById('root')))
  .catch(error => console.log(error));


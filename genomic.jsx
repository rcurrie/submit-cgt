import React from 'react';

function Genomic(props) {
  return (
    <div>
      <h1>Genomic</h1>
      <pre>{JSON.stringify(props.genomic, null, 2) }</pre>
    </div>
  );
}

module.exports = Genomic;

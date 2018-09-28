import React from 'react'

function Clinical(props) {
  return (
    <div>
      <h1>Clinical</h1>
      <pre>{JSON.stringify(props.clinical, null, 2) }</pre>
    </div>
  );
}

export default Clinical

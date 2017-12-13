import React from 'react';

// import * as dicomParser from 'dicom-parser';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';


class Image extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
    };

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    const config = {
      webWorkerPath: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js',
      taskConfiguration: {
        decodeTask: {
          codecsPath: 'cornerstoneWADOImageLoaderCodecs.min.js',
        },
      },
    };
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
  }

  componentDidMount() {
    const element = document.getElementById('dicomImage');
    cornerstone.enable(element);
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps', nextProps);
    if (nextProps.image) {
      cornerstone.imageCache.purgeCache();
      console.log('Parsing image from DICOM file');
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(nextProps.image);
      console.log(imageId);
      cornerstone.loadImage(imageId).then((image) => {
        console.log(image);
        // const element = document.getElementById('dicomImage');
        // const viewport = cornerstone.getDefaultViewport(element.children[0], image);
        // cornerstone.displayImage(element, image, viewport);
        this.setState({ image });
      }).catch(error => console.log(error));
    }
  }

  componentDidUpdate() {
    if (this.state.image) {
      const element = document.getElementById('dicomImage');
      const viewport = cornerstone.getDefaultViewport(element.children[0], this.state.image);
      cornerstone.displayImage(element, this.state.image, viewport);
    }
  }

  // componentWillUpdate(nextProps, nextState) {
  //   console.log('Image::componentWillUpdate', nextProps, nextState, this.props);
  //   if (nextProps.image) {
  //     console.log('Parsing image from DICOM file');
  //     const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(nextProps.image);
  //     console.log(imageId);
  //     cornerstone.loadImage(imageId).then((image) => {
  //       console.log(image);
  //       const element = document.getElementById('dicomImage');
  //       const viewport = cornerstone.getDefaultViewport(element.children[0], image);
  //       cornerstone.displayImage(element, image, viewport);
  //     }).catch(error => console.log(error));
  //   }
  // }
  // { this.state.image ?
  //   Object.entries(this.state.image.data.elements.forEach(([key, value]) => {
  //     return <li>{key + this.state.image.data.string(value.tag)}</li>;
  //   }) : 'Nothing'
  // }


  render() {
    console.log('Image::render', this.props, this.state);
    const keys = this.state.image ? Object.keys(this.state.image.data.elements) : [];
    const listItems = keys.map(key =>
      <li key={key}>{key}: {this.state.image.data.string(key)}</li>);
    return (
      <div>
        <h1>Image</h1>
        <div id="dicomImage" style={{ width: '512px', height: '512px' }} />
        <ul>{listItems}</ul>
      </div>
    );
  }
}

module.exports = Image;

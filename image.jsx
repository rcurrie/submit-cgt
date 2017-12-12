import React from 'react';

// import * as dicomParser from 'dicom-parser';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';


class Image extends React.Component {
  constructor(props) {
    super(props);
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
    //   // cornerstone.displayImage(props.image.elements, image);
    //   // { this.props.image ?
    //   //   Object.entries(this.props.image ? this.props.image.elements
    //   //   : {}).forEach(([key, value]) => {
    //   //     return <li>{key + this.props.image.string(value.tag)}</li>;
    //   //   }) : 'Nothing'
    //   // }
    //   console.log('Image::componentDidMount', this.props);
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('Image::componentWillUpdate', nextProps, nextState, this.props);
    if (nextProps.image) {
      console.log('Parsing image from DICOM file');
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(nextProps.image);
      console.log(imageId);
      cornerstone.loadImage(imageId).then((image) => {
        console.log(image);
        const element = document.getElementById('dicomImage');
        const viewport = cornerstone.getDefaultViewport(element.children[0], image);
        cornerstone.displayImage(element, image, viewport);
      }).catch(error => console.log(error));
    }
    //   const dataSet = this.props.image;
    //   const canvas = this.canvas;

    //   const width = dataSet.uint16('x00280011');
    //   const height = dataSet.uint16('x00280010');
    //   console.log(width, height);
    //   const pixelDataElement = dataSet.elements.x7fe00010;
    //   const pixelData = new Uint8Array(
    //     dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
    //   canvas.width = width;
    //   canvas.height = height;
    //   const context = canvas.getContext('2d');
    //   const imageData = context.getImageData(0, 0, width, height);
    //   const data = imageData.data;
    //   for (let i = 3, k = 0; i < data.byteLength; i += 4, k += 2) {
    //     let result = ((pixelData[k + 1] & 0xFF) << 8) | (pixelData[k] & 0xFF);
    //     result = (result & 0xFFFF) >> 8;
    //     data[i] = 255 - result;
    //   }
    //   context.putImageData(imageData, 0, 0);
    //   canvas.style.display = 'block';
    // }
  }

  render() {
    console.log('Image::render', this.props);
    return (
      <div>
        <h1>Image</h1>
        <div id="dicomImage" style={{ width: '512px', height: '512px' }} />
      </div>
    );
  }
}

module.exports = Image;

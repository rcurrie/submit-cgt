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
      webWorkerPath: '/cornerstone/cornerstoneWADOImageLoaderWebWorker.min.js',
      taskConfiguration: {
        decodeTask: {
          codecsPath: '/cornerstone/cornerstoneWADOImageLoaderCodecs.min.js',
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
    function deidentify(elements, byteArray) {
      // See https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4636522/
      const fields = {
        0x00080020: { label: 'StudyDate', type: 'date' },
        x00080021: { label: 'SeriesDate', type: 'date' },
        x00080022: { label: 'AcquisitionDate', type: 'date' },
        x00080023: { label: 'ContentDate', type: 'date' },
        x00080024: { label: 'OverlayDate', type: 'date' },
        x00080025: { label: 'CurveDate', type: 'date' },
        x0008002A: { label: 'AcquisitionDatetime', type: 'datetime' },
        x00080030: { label: 'StudyTime', type: 'time' },
        x00080031: { label: 'SeriesTime', type: 'time' },
        x00080032: { label: 'AcquisitionTime', type: 'time' },
        x00080033: { label: 'ContentTime', type: 'time' },
        x00080034: { label: 'OverlayTime', type: 'time' },
        x00080035: { label: 'CurveTime', type: 'time' },
        x00080050: { label: 'AccessionNumber', type: 'text' },
        x00080080: { label: 'InstitutionName', type: 'text' },
        x00080081: { label: 'InstitutionAddress', type: 'text' },
        x00080090: { label: 'ReferringPhysiciansName', type: 'text' },
        x00080092: { label: 'ReferringPhysiciansAddress', type: 'text' },
        x00080094: { label: 'ReferringPhysiciansTelephoneNumber', type: 'text' },
        x00080096: { label: 'ReferringPhysicianIDSequence', type: 'text' },
        x00081040: { label: 'InstitutionalDepartmentName', type: 'text' },
        x00081048: { label: 'PhysicianOfRecord', type: 'text' },
        x00081049: { label: 'PhysicianOfRecordIDSequence', type: 'text' },
        x00081050: { label: 'PerformingPhysiciansName', type: 'text' },
        x00081052: { label: 'PerformingPhysicianIDSequence', type: 'text' },
        x00081060: { label: 'NameOfPhysicianReadingStudy', type: 'text' },
        x00081062: { label: 'PhysicianReadingStudyIDSequence', type: 'text' },
        x00081070: { label: 'OperatorsName', type: 'text' },
        x00100010: { label: 'PatientsName', type: 'text' },
        x00100020: { label: 'PatientID', type: 'text' },
        x00100021: { label: 'IssuerOfPatientID', type: 'text' },
        x00100030: { label: 'PatientsBirthDate', type: 'date' },
        x00100032: { label: 'PatientsBirthTime', type: 'time' },
        x00100040: { label: 'PatientsSex', type: 'text' },
        x00101000: { label: 'OtherPatientIDs', type: 'text' },
        x00101001: { label: 'OtherPatientNames', type: 'text' },
        x00101005: { label: 'PatientsBirthName', type: 'text' },
        x00101010: { label: 'PatientsAge', type: 'text' },
        x00101040: { label: 'PatientsAddress', type: 'text' },
        x00101060: { label: 'PatientsMothersBirthName', type: 'text' },
        x00102150: { label: 'CountryOfResidence', type: 'text' },
        x00102152: { label: 'RegionOfResidence', type: 'text' },
        x00102154: { label: 'PatientsTelephoneNumbers', type: 'text' },
        x00200010: { label: 'StudyID', type: 'text' },
        x00321030: { label: 'Reason for Study', type: 'text' },
        x00321032: { label: 'Requesting Physician', type: 'text' },
        x00321033: { label: 'Requesting Service', type: 'text' },
        x00380300: { label: 'CurrentPatientLocation', type: 'text' },
        x00380400: { label: 'PatientsInstitutionResidence', type: 'text' },
        x0040A120: { label: 'DateTime', type: 'datetime' },
        x0040A121: { label: 'Date', type: 'date' },
        x0040A122: { label: 'Time', type: 'time' },
        x0040A123: { label: 'PersonName', type: 'text' },
      };

      Object.keys(elements).forEach((key) => {
        if (key in fields) {
          switch (fields[key].type) {
            case 'text':
              for (let i = 0; i < elements[key].length; i += 1) {
                byteArray[elements[key].dataOffset + i] = 0x58;
              }
              break;
            case 'date':
              for (let i = 0; i < elements[key].length; i += 1) {
                byteArray[elements[key].dataOffset + i] = '19700101'.charCodeAt(i);
              }
              break;
            case 'time':
              for (let i = 0; i < elements[key].length; i += 1) {
                byteArray[elements[key].dataOffset + i] = '000000.000000'.charCodeAt(i);
              }
              break;
            case 'datetime':
              for (let i = 0; i < elements[key].length; i += 1) {
                byteArray[elements[key].dataOffset + i] = '19700101000000.000000&0000'.charCodeAt(i);
              }
              break;
            default:
          }
        }
      });
    }

    if (nextProps.image) {
      cornerstone.imageCache.purgeCache();
      console.log('Parsing image from DICOM file');
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(nextProps.image);
      console.log('imageId', imageId);
      cornerstone.loadImage(imageId).then((image) => {
        console.log(image);
        deidentify(image.data.elements, image.data.byteArray);
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

  render() {
    const keys = this.state.image ? Object.keys(this.state.image.data.elements) : [];
    const listItems = this.state.image ?
      keys.map(key => <li key={key}>{key}: {this.state.image.data.string(key)}</li>) : <li />;
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

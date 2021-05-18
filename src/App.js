import React from "react";
import { DataGrid } from '@material-ui/data-grid';
import SearchField from "react-search-field";
import Modal from 'react-modal';

const API_MANUAL = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values:batchGet?ranges=Manual Upload&majorDimension=ROWS&key=${process.env.REACT_APP_API_KEY}`
const API_WEBSCRAPERS = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values:batchGet?ranges=Webscrapers&majorDimension=ROWS&key=${process.env.REACT_APP_API_KEY}`

const column_names = ["Timestamp", "Page Url", "Job", "Location", "Type", "Description", "Organization"]


const columns = [
  { field: 'Job', headerName: 'Job', flex: 0.3 },
  { field: 'Location', headerName: 'Location', flex: 0.3 },
  { field: 'Description', headerName: 'Description', flex: 0.5 },
];

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      items: [],
      selectedRow: undefined,
      searchValue: "",
      isModalOpen: false
    }
  }

  async componentDidMount() {
    let manual_result = await fetch(API_MANUAL);
    let webscraper_result = await fetch(API_WEBSCRAPERS);

    let manual = await manual_result.json();
    let webscrapers = await webscraper_result.json();

    let manual_values = manual.valueRanges[0].values
    let webscraper_values = webscrapers.valueRanges[0].values

    let data = manual_values.slice(1, manual_values.length).concat(webscraper_values.slice(1, webscraper_values.length));

    let result = [];
    for (let i = 1; i < data.length; i++) {
      let rowObject = { id: i };
      for (let j = 0; j < column_names.length; j++) {
        rowObject[column_names[j]] = data[i][j];
      }
      result.push(rowObject);
    }

    this.setState({ items: result });
  }

  filterResults = (row) => {
    let contains = false
    for (const key of ["Description", "Location", "Job"]) {
      contains = contains || row[key].toLocaleLowerCase().includes(this.state.searchValue.toLocaleLowerCase());
    }

    return contains;
  }

  onRowSelected = row => {
    this.setState({
      selectedRow: row.data,
      isModalOpen: true
    })
  }

  render() {
    return (
      <div style={{ height: 800, width: '100%' }}>
        <h1 id="title" align="center">Immunization Economics Job Postings</h1>
        <h2>Search by keyword:</h2>
        <SearchField
          className="search"
          placeholder="Search..."
          onChange={(newValue) => this.setState({ searchValue: newValue })}
        />
        <Modal
          isOpen={this.state.isModalOpen}
          onRequestClose={() => this.setState({ isModalOpen: false })}
          ariaHideApp={false}
          style={customStyles}
        >
          <DataRow {...this.state.selectedRow} />
        </Modal>
        <DataGrid
          className="table"
          pageSize={25}
          onRowSelected={this.onRowSelected}
          rowHeight={52}
          rows={JSON.parse(JSON.stringify(this.state.items.filter(this.filterResults)))}
          columns={columns}
          autoHeight
          rowsPerPageOptions={[25, 50, 100]}
        />
      </div >
    );
  }
}

const DataRow = props => {
  return (
    <div className="data-row-container">
      <div className="data-header">
        <a target="_blank" rel="noopener noreferrer" href={props["Page Url"]}> {"Jump to Job Listing (takes you to external page)"}</a>
        <div> {"Job"}{":    "} {props["Job"]} </div>
        <div> {"Location"}{":    "} {props["Location"]} </div>
        <div> {"Type"}{":    "} {props["Type"]} </div>
        <div> {"Organization"} {":    "} {props["Organization"]} </div>
      </div>

      <div className="data-row-description" dangerouslySetInnerHTML={{ __html: props["Description"] }} />
    </div>
  )
}

const customStyles = {
  content: {
    top: '100px',
    bottom: '100px',
  }
};

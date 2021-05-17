import React from "react";
import { DataGrid } from '@material-ui/data-grid';
import SearchField from "react-search-field";

const API_MANUAL = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values:batchGet?ranges=Manual Upload&majorDimension=ROWS&key=${process.env.REACT_APP_API_KEY}`
const API_WEBSCRAPERS = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SPREADSHEET_ID}/values:batchGet?ranges=Webscrapers&majorDimension=ROWS&key=${process.env.REACT_APP_API_KEY}`

const column_names = ["Timestamp", "Page Url", "Job", "Location", "Type", "Description", "Organization"]


const columns = [
  { field: 'Page Url', headerName: 'Page Url', flex: 0.2, TextWrapping: "Wrap" },
  { field: 'Job', headerName: 'Job', flex: 0.3 },
  { field: 'Location', headerName: 'Location', flex: 0.3 },
  { field: 'Type', headerName: 'Type', flex: 0.3 },
  { field: 'Description', headerName: 'Description', flex: 0.5 },
  { field: "Organization", headerName: "Organization", flex: 0.2 }
];

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      items: [],
      selectedRow: undefined,
      searchValue: ""
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

    console.log(data)

    const result = [];
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
    for (const key of column_names) {
      contains = contains || row[key].toLocaleLowerCase().includes(this.state.searchValue.toLocaleLowerCase());
    }

    return contains;
  }

  render() {
    return (
      <div style={{ height: 800, width: '100%' }}>
        <SearchField
          placeholder="Search..."
          onChange={(newValue) => this.setState({ searchValue: newValue })}
        />
        {this.state.selectedRow && <DataRow {...this.state.selectedRow} />}
        <DataGrid pageSize={25} onRowSelected={row => { this.setState({ selectedRow: row.data }) }} rowHeight={52} rows={JSON.parse(JSON.stringify(this.state.items.filter(this.filterResults)))} columns={columns} autoHeight rowsPerPageOptions={[25, 50, 100]} />
      </div>
    );
  }
}
//["Timestamp", "Page Url", "Job", "Location", "Type", "Description", "Organization"]
const DataRow = props => {
  return (
    <div className="data-row-container">
      <a id={1} target="_blank" rel="noopener noreferrer" href={props["Page Url"]}> {"Jump to Job Listing (takes you to external page)"}</a>
      <div id={2}> {"Job"} {":    "} {props["Job"]} </div>
      <div id={3}> {"Location"} {":    "} {props["Location"]} </div>
      <div id={4}> {"Type"} {":    "} {props["Type"]} </div>
      <div id={6} > {"Organization"} {":    "} {props["Organization"]} </div>
      <div id={5} className="data-row-description"> {"Description"} {":    "} {props["Description"]} </div>
    </div>
  )
}
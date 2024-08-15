import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'; // Adjust the path if necessary

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    fields: [],
    regions: [],
  });

  const [selectedOptions, setSelectedOptions] = useState({
    field: '',
    institution: '',
    region: '',
    citations: '',
    hindex: '',
    i10: '',
    imp_fac: '',
    age: '',
    years: ''
  });

  const [searchResults, setSearchResults] = useState([]);

  // State to keep track of the active sorting button
  const [activeSorting, setActiveSorting] = useState({
    citations: '-',
    hindex: '-',
    i10: '-',
    imp_fac: '-',
    age: '-',
    years: '-',
  });

  const apiUrl = process.env.REACT_APP_API_URL; // Access the environment variable

  useEffect(() => {
    // Fetch unique fields
    console.log('Fetching unique fields...');
    fetch(`${apiUrl}/api/dropdown/fields`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique fields:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          fields: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });

    // Fetch unique regions
    console.log('Fetching unique regions...');
    fetch(`${apiUrl}/api/dropdown/regions`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique regions:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          regions: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching regions:', error);
      });
  }, [apiUrl]);

  useEffect(() => {
    handleSearch();
  }, [selectedOptions.citations,
      selectedOptions.hindex,
      selectedOptions.i10,
      selectedOptions.imp_fac,
      selectedOptions.age,
      selectedOptions.years
  ]); // Trigger search whenever selectedOptions of sorting changes

  // For dropdown menus
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing setting state of ${name} to ${value}`)
    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Search table based on values selected in the dropdown and sorting buttons
  const handleSearch = () => {
    console.log('Selected options:', selectedOptions);
    fetch(`${apiUrl}/api/search?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}&citations=${selectedOptions.citations}&hindex=${selectedOptions.hindex}&i10=${selectedOptions.i10}&imp_fac=${selectedOptions.imp_fac}&age=${selectedOptions.age}&years=${selectedOptions.years}`)
      .then(response => response.json())
      .then(data => {
        console.log('Search results:', data);
        setSearchResults(data);
      })
      .catch(error => {
        console.error('Error during search:', error);
      });
  };

  // Download CSV
  const handleDownloadCSV = () => {
    console.log("Downloading CSV");
    window.open(`${apiUrl}/api/download/export/csv?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}&citations=${selectedOptions.citations}&hindex=${selectedOptions.hindex}&i10=${selectedOptions.i10}&imp_fac=${selectedOptions.imp_fac}&age=${selectedOptions.age}&years=${selectedOptions.years}`, '_blank');
  };

  // Download PDF
  const handleDownloadPDF = () => {
    console.log("Downloading PDF");
    window.open(`${apiUrl}/api/download/export/pdf?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}&citations=${selectedOptions.citations}&hindex=${selectedOptions.hindex}&i10=${selectedOptions.i10}&imp_fac=${selectedOptions.imp_fac}&age=${selectedOptions.age}&years=${selectedOptions.years}`, '_blank');
  };

  // Clear selections in sorting and revert butons to un-sorting state
  const handleClearSortingSelection = () => {
    console.log("Clearing sorting states");

    setSelectedOptions(prevState => ({
      ...prevState,
      citations: '',
      hindex: '',
      i10: '',
      imp_fac: '',
      age: '',
      years: ''
    }));

    console.log("Setting buttons to -");
    setActiveSorting({
      citations: '-',
      hindex: '-',
      i10: '-',
      imp_fac: '-',
      age: '-',
      years: '-',
    });

    // console.log("Searching again");
    // handleSearch();
  };

  // Sort the column and change the state of the button
  const handleSorting = (e) => {
    const { name } = e.target;

    handleClearSortingSelection();

    console.log(`Sorting ${name} in DESC order`);
    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: 'DESC',
    }));

    console.log(`Setting the button of ${name} to v`);
    // Update the active sorting button
    setActiveSorting(prevState => ({
      ...prevState,
      [name]: 'v',
    }));
  };

  return (
    <div>
      <nav className="navbar custom-navbar">
        <div className="navbar-title">For the People, Find the People</div>
      </nav>
      <div className="container">
        <div className="dropdown-container d-flex align-items-center mt-4">
          <select className="form-control mr-2" name="field" value={selectedOptions.field} onChange={handleInputChange}>
            <option value="">Field</option>
            {dropdownOptions.fields.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChange}
            placeholder="Enter Institution"
          />

          <select className="form-control mr-2" name="region" value={selectedOptions.region} onChange={handleInputChange}>
            <option value="">Region</option>
            {dropdownOptions.regions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            {/* <button className="btn clear-sorting-button" onClick={handleClearSortingSelection}>Clear Sorting Selections</button> */}
            <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
            <button className="btn download-button" onClick={handleDownloadPDF}>Download PDF</button>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th title="Full name of the expert">Name</th>
                  <th title="The current field of the expert">Field of Study</th>
                  <th title="Current institutional affiliation of the expert">Institution</th>
                  <th title="The region in which the expert's institutional affiliation is located">Region</th>
                  <th title="How many times the expert has been cited">Times Cited
                    <button className="btn sorting-button" name="citations" onClick={handleSorting}>{activeSorting.citations}</button>
                  </th>
                  <th title="The number of papers (h) that have received (h) or more citations">H-index
                    <button className="btn sorting-button" name="hindex" onClick={handleSorting}>{activeSorting.hindex}</button>
                  </th>
                  <th title="The number of publications an expert has with at least 10 citations">I10-index
                    <button className="btn sorting-button" name="i10" onClick={handleSorting}>{activeSorting.i10}</button>
                  </th>
                  <th title="The average number of citations of an expert within the last 2 years">Impact Factor
                    <button className="btn sorting-button" name="imp_fac" onClick={handleSorting}>{activeSorting.imp_fac}</button>
                  </th>
                  <th title="The age of the expert">Age
                    <button className="btn sorting-button" name="age" onClick={handleSorting}>{activeSorting.age}</button>
                  </th>
                  <th title="How many years the expert has been in their field">Years In Field
                    <button className="btn sorting-button" name="years" onClick={handleSorting}>{activeSorting.years}</button>
                  </th>
                  <th title="The email of the expert or where their email can be found">Email</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.name}</td>
                    <td>{result.field_of_study}</td>
                    <td>{result.institution}</td>
                    <td>{result.region}</td>
                    <td>{result.citations}</td>
                    <td>{result.hindex}</td>
                    <td>{result.i_ten_index}</td>
                    <td>{result.impact_factor}</td>
                    <td>{result.age}</td>
                    <td>{result.years_in_field}</td>
                    <td>{result.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

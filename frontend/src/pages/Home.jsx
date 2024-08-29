import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'; // Adjust the path if necessary

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    fields: [],
    regions: [],
  });

  const [selectedOptions, setSelectedOptions] = useState({
    field: [],
    institution: '',
    region: [],
    citations: '',
    hindex: '',
    i_ten_index: '',
    impact_factor: '',
    age: '',
    years_in_field: '',
    sorting_sequence: ''
  });

  const [searchResults, setSearchResults] = useState([]);

  // State to keep track of the active sorting button
  const [activeSorting, setActiveSorting] = useState({
    citations: '-',
    hindex: '-',
    i_ten_index: '-',
    impact_factor: '-',
    age: '-',
    years_in_field: '-',
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleSearch();
  }, [selectedOptions.citations,
      selectedOptions.hindex,
      selectedOptions.i_ten_index,
      selectedOptions.impact_factor,
      selectedOptions.age,
      selectedOptions.years_in_field
  ]); // Trigger search whenever selectedOptions of sorting changes

  // For dropdown menus
  const handleInputChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (e.target.multiple) {
      const values = Array.from(selectedOptions, option => option.value);
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: values,
      }));
    } else {
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Search table based on values selected in the dropdown and sorting buttons
  const handleSearch = () => {
    console.log('Selected options:', selectedOptions);
    const queryString = new URLSearchParams({
      field_of_study: selectedOptions.field.join(','), // Join selected fields with commas
      raw_institution: selectedOptions.institution,
      region: selectedOptions.region.join(','), // Join selected regions with commas
      sorting_sequence: selectedOptions.sorting_sequence,
    }).toString();

    fetch(`${apiUrl}/api/search?${queryString}`)
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
    window.open(`${apiUrl}/api/download/export/csv?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}&sorting_sequence=${selectedOptions.sorting_sequence}`, '_blank');
  };

  // Download PDF
  const handleDownloadPDF = () => {
    console.log("Downloading PDF");
    window.open(`${apiUrl}/api/download/export/pdf?field_of_study=${selectedOptions.field}&raw_institution=${selectedOptions.institution}&region=${selectedOptions.region}&sorting_sequence=${selectedOptions.sorting_sequence}`, '_blank');
  };

  // Clear selections in sorting and revert butons to un-sorting state
  const handleClearSortingSelection = () => {
    console.log("Clearing sorting states");

    setSelectedOptions(prevState => ({
      ...prevState,
      citations: '',
      hindex: '',
      i_ten_index: '',
      impact_factor: '',
      age: '',
      years_in_field: '',
      sorting_sequence: ''
    }));

    console.log("Setting buttons to -");
    setActiveSorting({
      citations: '-',
      hindex: '-',
      i_ten_index: '-',
      impact_factor: '-',
      age: '-',
      years_in_field: '-'
    });
  };

  // Sort the column and change the state of the button
  // Creates the string used for sorting
  const handleSorting = (e) => {
    const { name } = e.target;

    // handleClearSortingSelection();

    //  let sortingSequence = selectedOptions.sorting_sequence
    const oldDirection = activeSorting[name];
    let buttonDirection = '';
    let sortOrder = '';

    // Change the direction of the button
    if (oldDirection === '-') buttonDirection = 'v';
    else if (oldDirection === 'v') buttonDirection = '^';
    else if (oldDirection === '^') buttonDirection = '-';

    // Decide sorting order based on the button
    if (buttonDirection === '-') sortOrder = '';
    else if (buttonDirection === 'v') sortOrder = 'DESC';
    else if (buttonDirection === '^') sortOrder = 'ASC';

    // console.log(`name: ${name}, value: ${sortOrder}`);

    // Create the sorting sequence string and format correctly
    //==================================================

    const sortingSequence = selectedOptions.sorting_sequence;
    // console.log(`sortingSequence = ${sortingSequence}`);

    const sequenceSplitComma = sortingSequence ? sortingSequence.split(',') : [];
    // console.log(`sequenceSplitComma = ${sequenceSplitComma}`);

    let finalSequence = '';

    // boolean used to add the new value at the end if it hasn't been added yet
    let addFinal = true;

    // case if nothing is in the sortingSequence
    // Only execute if empty sequence AND sortOrder is not NULL
    if (!sortingSequence && sortOrder) {
      // console.log("sortingSequence is empty and sortOrder is not null");

      // creates a single string "name:value"
      let subSequence = '';
      subSequence = subSequence.concat(name,':',sortOrder);
      // console.log(`subSequence = ${subSequence}`);

      // full string "name1:value1,name2:value2,"
      finalSequence = finalSequence.concat(subSequence, ",");

      addFinal = false;
    } else {
      // console.log("Reformatting sorting sequence");
      for (let pair of sequenceSplitComma) {
        // If the pair does not exist, don't proceed
        if (!pair) continue;

        let nameValPair = pair.split(':');
        // console.log(`Old name value pair: ${nameValPair}`)
  
        // then name in name:value
        let oldName = nameValPair[0]
  
        if (name === oldName) {
          nameValPair[1] = sortOrder;

          // value got updated, don't use again
          addFinal = false;
        };
        
        // console.log(`New name value pair: ${nameValPair}`);
  
        // value in name:value
        // if the value exists, append. Else, don't append
        if (nameValPair[1]) {
          // creates a single string "name:value"
          let subSequence = '';
          subSequence = subSequence.concat(nameValPair[0], ':', nameValPair[1])
          // console.log(`subSequence = ${subSequence}`);
        
          // full string "name1:value1,name2:value2,"
          finalSequence = finalSequence.concat(subSequence, ",");
        }
      }
    }

    if (addFinal) {
      // Add the new value if it wasn't already added
    let nameValPair = name.concat(':',sortOrder);
    // console.log(`nameValPair = ${nameValPair}`)
    finalSequence = finalSequence.concat(nameValPair, ',');
    }

    //==================================================
    
    // Set the sorting sequence to the new adjusted sequence
    console.log(`Final sorting sequence = ${finalSequence}`);
    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: sortOrder,
      sorting_sequence: finalSequence,
    }));

    console.log(`Setting the button of ${name} to ${buttonDirection}`);
    // Update the button symbol
    setActiveSorting(prevState => ({
      ...prevState,
      [name]: buttonDirection,
    }));
  };

  return (
    <div>
      <nav className="navbar custom-navbar">
        <div className="navbar-title">For the People, Find the People</div>
      </nav>
      <div className="input-info">
        <p>For the institutions, please enter institutions separated by a comma with no space, as such: Institution 1,Institution 2,Institution 3</p>
      </div>
      <div className="container">
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Field dropdown menu */}
          <select className="form-control mr-2" name="field" value={selectedOptions.field} onChange={handleInputChange} multiple>
            <option value="">Field</option>
            {dropdownOptions.fields.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          
          {/* Institution text input */}
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChange}
            placeholder="Enter Institution(s)"
          />

          {/* Region dropdown menu */}
          <select className="form-control mr-2" name="region" value={selectedOptions.region} onChange={handleInputChange} multiple>
            <option value="">Region</option>
            {dropdownOptions.regions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            <button className="btn clear-sorting-button" onClick={handleClearSortingSelection}>Clear Sorting Selections</button>
            <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
            <button className="btn download-button" onClick={handleDownloadPDF}>Download PDF</button>
            <div className="sorting-order"> 
              <p>Sorting order: {selectedOptions.sorting_sequence}</p>
            </div>
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
                  <th title="The number of publications an expert has with at least 10 citations">i_ten_index-index
                    <button className="btn sorting-button" name="i_ten_index" onClick={handleSorting}>{activeSorting.i_ten_index}</button>
                  </th>
                  <th title="The average number of citations of an expert within the last 2 years">Impact Factor
                    <button className="btn sorting-button" name="impact_factor" onClick={handleSorting}>{activeSorting.impact_factor}</button>
                  </th>
                  {/* <th title="The age of the expert">Age
                    <button className="btn sorting-button" name="age" onClick={handleSorting}>{activeSorting.age}</button>
                  </th>
                  <th title="How many years the expert has been in their field">Years In Field
                    <button className="btn sorting-button" name="years_in_field" onClick={handleSorting}>{activeSorting.years_in_field}</button>
                  </th> */}
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
                    {/* <td>{result.age}</td>
                    <td>{result.years_in_field}</td> */}
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

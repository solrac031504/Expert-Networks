import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css'; // Adjust the path if necessary

const Home = () => {
  const [dropdownOptions, setDropdownOptions] = useState({
    domains: [],
    fields: [],
    subfields: [],
    topics: [],
    continents: [],
    regions: [],
    subregions: [],
    countries: []
  });

  const [selectedOptions, setSelectedOptions] = useState({
    domain: [],
    field: [],
    subfield: [],
    topic: [],
    institution: '',
    continent: [],
    region: [],
    subregion: [],
    country: [],
    citations: '',
    hindex: '',
    i_ten_index: '',
    impact_factor: '',
    age: '',
    years_in_field: '',
    sorting_sequence: '', 
    is_global_south: ''
  });

  const [searchResults, setSearchResults] = useState([]);

  // For the loading circle
  const [loading, setLoading] = useState(true);

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
    // Fetch unique domains
    console.log('Fetching unique domains...');
    fetch(`${apiUrl}/api/dropdown/study/domains`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique domains:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          domains: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching domains:', error);
      });

    // Fetch unique continents
    console.log('Fetching unique continents...');
    fetch(`${apiUrl}/api/dropdown/geo/continents`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique continents:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          continents: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching continents:', error);
      });
  }, [apiUrl]);

  // Fetch unique fields when domain changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      domain_id: selectedOptions.domain.id,
    }).toString();

    console.log('Fetching unique fields...');
    fetch(`${apiUrl}/api/dropdown/study/fields?${queryParams}`)
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
  }, [selectedOptions.domain])

  // Fetch unique subfields when field changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      field_id: selectedOptions.field.id,
    }).toString();

    console.log('Fetching unique subfields...');
    fetch(`${apiUrl}/api/dropdown/study/subfields?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique subfields:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          subfields: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching subfields:', error);
      });
  }, [selectedOptions.field])

  // Fetch unique topics when subfield changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      subfield_id: selectedOptions.subfield.id,
    }).toString();

    console.log('Fetching unique topics...');
    fetch(`${apiUrl}/api/dropdown/study/topics?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique topics:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          topics: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching topics:', error);
      });
  }, [selectedOptions.subfield])

  // Fetch unique regions when continent changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      continent_id: selectedOptions.continent.id,
    }).toString();

    console.log('Fetching unique regions...');
    fetch(`${apiUrl}/api/dropdown/geo/regions?${queryParams}`)
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
  }, [selectedOptions.continent])

  // Fetch unique subregions when region changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      region_id: selectedOptions.region.id,
    }).toString();

    console.log('Fetching unique subregions...');
    fetch(`${apiUrl}/api/dropdown/geo/subregions?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique subregions:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          subregions: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching subregions:', error);
      });
  }, [selectedOptions.region])

  // Fetch unique countries when regions OR subregions changes
  useEffect(() => {
    const queryParams = new URLSearchParams({
      region_id: selectedOptions.region.id,
      subregion_id: selectedOptions.subregion.id
    }).toString();

    console.log('Fetching unique countries...');
    fetch(`${apiUrl}/api/dropdown/geo/countries?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        console.log('Received unique countries:', data);
        setDropdownOptions(prevState => ({
          ...prevState,
          countries: data,
        }));
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, [selectedOptions.region, selectedOptions.subregion])


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleSearch();
  }, [selectedOptions.citations,
      selectedOptions.hindex,
      selectedOptions.i_ten_index,
      selectedOptions.impact_factor,
      selectedOptions.age,
      selectedOptions.years_in_field,
      selectedOptions.is_global_south
  ]); // Trigger search whenever selectedOptions of sorting changes

  // Handle the change in the text box
  const handleInputChangeText = (e) => {
    const { name, value } = e.target;

    setSelectedOptions(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Dropdown menus
  const handleInputChange = (e) => {
    const { name, value, selectedOptions, options, type } = e.target;
  
    // Handle multiple selection for dropdowns
    if (e.target.multiple) {
      const selectedValues = Array.from(selectedOptions, option => {
        return {
          id: option.value,
          name: option.textContent // Assuming the textContent is the name
        };
      });
      
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: selectedValues,
      }));
    } 
    // Handle radio button inputs (and single dropdowns)
    else if (type === 'radio') {
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: value,  // For radio buttons, store just the value
      }));
    } 
    // Handle normal dropdowns (single select)
    else {
      const selectedData = {
        id: value,
        name: options ? options[e.target.selectedIndex].textContent : '' // Get name for dropdowns
      };
      
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: selectedData,
      }));
    }
  };
  

  const createURL = () => {
    // Create an object with only valid key-value pairs
    const validParams = Object.fromEntries(
      Object.entries({
        domain: selectedOptions.domain.id,
        field: selectedOptions.field.id,
        subfield: selectedOptions.subfield.id,
        topic: selectedOptions.topic.id,
        continent: selectedOptions.continent.id,
        region: selectedOptions.region.id,
        subregion: selectedOptions.subregion.id,
        country: selectedOptions.country.id,
        institution: selectedOptions.institution
      }).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );

    const queryString = new URLSearchParams(validParams).toString();

    return queryString;
  };

// Search table based on values selected in the dropdown and sorting buttons
const handleSearch = async () => {
  console.log('Selected options:', selectedOptions);

  const queryString = createURL();

  setLoading(true);

  try {
    const response = await fetch(`${apiUrl}/api/search?${queryString}`);
    const data = await response.json();

    console.log('Search results:', data);

    // Filter results based on the global south selection
    const filteredResults = data.filter(result => {
      if (selectedOptions.is_global_south === "0") {
        return true; // Include all results
      } else if (selectedOptions.is_global_south === "1") {
        return result.is_global_south === 0; // Exclude Global South
      } else if (selectedOptions.is_global_south === "2") {
        return result.is_global_south === 1; // Only Global South
      }
      return true; // Default case (if no selection, include all)
    });

    setSearchResults(filteredResults); // Update the state with filtered results
  } catch (error) {
    console.error('Error during search:', error);
  }

  setLoading(false);
  console.log('Search Results:', searchResults)
};


  // Download CSV
  const handleDownloadCSV = () => {
    console.log("Downloading CSV");
    const queryString = createURL();
    window.open(`${apiUrl}/api/download/export/csv?${queryString}`, '_blank');
  };

  // Download XLS
  const handleDownloadXLS = () => {
    console.log("Downloading XLS");
    const queryString = createURL();
    window.open(`${apiUrl}/api/download/export/xls?${queryString}`, '_blank');
  };

  // Download PDF
  const handleDownloadPDF = () => {
    console.log("Downloading PDF");
    const queryString = createURL();
    window.open(`${apiUrl}/api/download/export/pdf?${queryString}`, '_blank');
  };

  const handleClearFilterSelection = () => {
    setSelectedOptions(prevState => ({
      domains: [],
      fields: [],
      subfields: [],
      topics: [],
      continents: [],
      regions: [],
      subregions: [],
      countries: [],
      institution: '',
    }));
  };

  //Clear filters function
  const clearFilters = () => {
    setSelectedOptions({
        domain: [],
        field: [],
        subfield: [],
        topic: [],
        institution: '',
        continent: [],
        region: [],
        subregion: [],
        country: [],
        citations: '',
        hindex: '',
        i_ten_index: '',
        impact_factor: '',
        age: '',
        years_in_field: '',
        sorting_sequence: ''
    });

    // setDropdownOptions({
    //     domains: [],
    //     fields: [],
    //     subfields: [],
    //     topics: [],
    //     continents: [],
    //     regions: [],
    //     subregions: [],
    //     countries: []
    // });

    setSearchResults([]);

    setActiveSorting({
        citations: '-',
        hindex: '-',
        i_ten_index: '-',
        impact_factor: '-',
        age: '-',
        years_in_field: '-',
    });
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
      sorting_sequence: '',
      is_global_south: ''
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
      <div className="container">
        {/* Dropdowns for the fields of study */}
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Domain dropdown menu */}
          <select
            className="form-control mr-2"
            name="domain"
            value={selectedOptions.domain.id || ''}
            onChange={handleInputChange}
          >
            <option value="">Domain</option>
            {dropdownOptions.domains.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* Field dropdown menu - only show if domain is selected */}
          {selectedOptions.domain.id && (
            <select
              className="form-control mr-2"
              name="field"
              value={selectedOptions.field.id || ''}
              onChange={handleInputChange}
            >
              <option value="">Field</option>
              {(Array.isArray(dropdownOptions.fields) ? dropdownOptions.fields : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Subfield dropdown menu - only show if field is selected */}
          {selectedOptions.field.id && (
            <select
              className="form-control mr-2"
              name="subfield"
              value={selectedOptions.subfield.id || ''}
              onChange={handleInputChange}
            >
              <option value="">Subfield</option>
              {(Array.isArray(dropdownOptions.subfields) ? dropdownOptions.subfields : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Topic dropdown menu - only show if subfield is selected */}
          {selectedOptions.subfield.id && (
            <select
              className="form-control mr-2"
              name="topic"
              value={selectedOptions.topic.id || ''}
              onChange={handleInputChange}
            >
              <option value="">Topic</option>
              {(Array.isArray(dropdownOptions.topics) ? dropdownOptions.topics : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Dropdowns for the geographic regions */}
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Continent dropdown menu */}
          <select 
            className="form-control mr-2" 
            name="continent" 
            value={selectedOptions.continent.id || ''} 
            onChange={handleInputChange}
          >
            <option value="">Continent</option>
            {dropdownOptions.continents.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          {/* Region dropdown menu */}
          {selectedOptions.continent.id && (
            <select 
              className="form-control mr-2" 
              name="region" 
              value={selectedOptions.region.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Region</option>
              {(Array.isArray(dropdownOptions.regions) ? dropdownOptions.regions : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Subregion dropdown menu */}
          {selectedOptions.region.id && (
            <select 
              className="form-control mr-2" 
              name="subregion" 
              value={selectedOptions.subregion.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Subregion</option>
              {(Array.isArray(dropdownOptions.subregions) ? dropdownOptions.subregions : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

          {/* Country dropdown menu */}
          {selectedOptions.region.id && (
            <select 
              className="form-control mr-2" 
              name="country" 
              value={selectedOptions.country.id || ''} 
              onChange={handleInputChange}
            >
              <option value="">Country</option>
              {(Array.isArray(dropdownOptions.countries) ? dropdownOptions.countries : []).map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          )}

        </div>

        {/* Institution text input */}
        <div className="textbox-container d-flex align-items-center mt-4">
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChangeText}
            placeholder="Enter Institution(s)"
          />
        </div>
        <div className="radio-container mt-4 d-flex">
          <div className="form-check mr-3">
            <input
              className="form-check-input"
              type="radio"
              name="is_global_south"
              id="globalSouthInclude"
              value={0}
              checked={selectedOptions.is_global_south === 0}
              onChange={handleInputChange}
            />
            <label className="form-check-label text-left" htmlFor="globalSouthInclude">
              Include Global South
            </label>
          </div>
          <div className="form-check mr-3">
            <input
              className="form-check-input"
              type="radio"
              name="is_global_south"
              id="globalSouthExclude"
              value={1}
              checked={selectedOptions.is_global_south === 1}
              onChange={handleInputChange}
            />
            <label className="form-check-label text-left" htmlFor="globalSouthExclude">
              Exclude Global South
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="is_global_south"
              id="onlyGlobalSouth"
              value={2}
              checked={selectedOptions.is_global_south === 2}
              onChange={handleInputChange}
            />
            <label className="form-check-label text-left" htmlFor="onlyGlobalSouth">
              Only Global South
            </label>
          </div>
        </div>




        {/* If the data is loading, show the spinner
            Once it is done loading, display the resulting table */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div>
            {/* Render the content once the data has been fetched */}
            {searchResults.length > 0 ? (
              <div className="mt-4">
                {/* <button className="btn clear-sorting-button" onClick={handleClearSortingSelection}>Clear Sorting Selections</button> */}
                <button className="btn filter-button" onClick={handleSearch}>Search</button>
                <button className="btn filter-button" onClick={clearFilters}>Clear Filters</button>
                <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
                <button className="btn download-button" onClick={handleDownloadXLS}>Download XLS</button>
                <button className="btn download-button" onClick={handleDownloadPDF}>Download PDF</button>
                {/* <div className="sorting-order"> 
                  <p>Sorting order: {selectedOptions.sorting_sequence}</p>
                </div> */}
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th title="Full name of the expert">Name</th>
                      <th title="Current institutional affiliation of the expert">Institution</th>
                      <th title="The country in which the expert's institutional affiliation is located">Country</th>
                      <th title="Total number of works published by this expert">Works Count</th>
                      <th title="How many times the expert has been cited">Times Cited</th>
                      <th title="The number of papers (h) that have received (h) or more citations">H-index</th>
                      <th title="The number of publications an expert has with at least 10 citations">I10-Index</th>
                      <th title="The average number of citations of an expert within the last 2 years starting at the last year">Impact Factor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.author_name}</td>
                        <td>{result.institution_name}</td>
                        <td>{result.country_name || 'N/A'}</td>
                        <td>{result.works_count}</td>
                        <td>{result.cited_by_count}</td>
                        <td>{result.hindex}</td>
                        <td>{result.i_ten_index}</td>
                        <td>{result.impact_factor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-authors">
                <h2>No Authors Found</h2>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

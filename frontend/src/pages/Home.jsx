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
    sorting: '',
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
      selectedOptions.years_in_field
  ]); // Trigger search whenever selectedOptions of sorting changes

  // Dropdown menus
  const handleInputChange = (e) => {
    const { name, value, selectedOptions, options } = e.target;
  
    // Supposedly for multiple, will handle later
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
    } else {
      const selectedData = {
        id: value,
        name: options ? options.textContent : ''
      };
      
      setSelectedOptions(prevState => ({
        ...prevState,
        [name]: selectedData,
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
  /*const handleSorting = (e) => {
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
  };*/

  const handleSortingChange = (event) => {
    const sortingValue = event.target.value;
  
    // Update selectedOptions state with the new sorting value
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      sorting: sortingValue,
      sorting_sequence: getSortingDescription(sortingValue) // This will display a readable sorting description
    }));
  
    // Call the sorting function if necessary to apply the sorting logic immediately
    sortSearchResults(sortingValue);
  };

  const getSortingDescription = (sortingValue) => {
    switch (sortingValue) {
      case 'citations_asc':
        return 'Citations (Ascending)';
      case 'citations_desc':
        return 'Citations (Descending)';
      case 'hindex_asc':
        return 'H-Index (Ascending)';
      case 'hindex_desc':
        return 'H-Index (Descending)';
      case 'i10index_asc':
        return 'i10-Index (Ascending)';
      case 'i10index_desc':
        return 'i10-Index (Descending)';
      case 'impact_factor_asc':
        return 'Impact Factor (Ascending)';
      case 'impact_factor_desc':
        return 'Impact Factor (Descending)';
      case 'age_asc':
        return 'Age (Ascending)';
      case 'age_desc':
        return 'Age (Descending)';
      case 'years_in_field_asc':
        return 'Years in Field (Ascending)';
      case 'years_in_field_desc':
        return 'Years in Field (Descending)';
      default:
        return '';
    }
  };

  const sortSearchResults = (sortingValue) => {
    const sortedResults = [...searchResults]; // Create a copy of the current results to sort
  
    switch (sortingValue) {
      case 'citations_asc':
        sortedResults.sort((a, b) => a.citations - b.citations);
        break;
      case 'citations_desc':
        sortedResults.sort((a, b) => b.citations - a.citations);
        break;
      case 'hindex_asc':
        sortedResults.sort((a, b) => a.hindex - b.hindex);
        break;
      case 'hindex_desc':
        sortedResults.sort((a, b) => b.hindex - a.hindex);
        break;
      case 'i10index_asc':
        sortedResults.sort((a, b) => a.i_ten_index - b.i_ten_index);
        break;
      case 'i10index_desc':
        sortedResults.sort((a, b) => b.i_ten_index - a.i_ten_index);
        break;
      case 'impact_factor_asc':
        sortedResults.sort((a, b) => a.impact_factor - b.impact_factor);
        break;
      case 'impact_factor_desc':
        sortedResults.sort((a, b) => b.impact_factor - a.impact_factor);
        break;
      case 'age_asc':
        sortedResults.sort((a, b) => a.age - b.age);
        break;
      case 'age_desc':
        sortedResults.sort((a, b) => b.age - a.age);
        break;
      case 'years_in_field_asc':
        sortedResults.sort((a, b) => a.years_in_field - b.years_in_field);
        break;
      case 'years_in_field_desc':
        sortedResults.sort((a, b) => b.years_in_field - a.years_in_field);
        break;
      default:
        break;
    }
  
    // Update the search results with the sorted array
    setSearchResults(sortedResults);
  };
  

  const handleSorting = (e) => {
    const { name } = e.target;
    let sortOrder = '';

    // Toggle between ascending, descending, and reset ('-', 'ASC', 'DESC')
    const oldDirection = activeSorting[name];
    if (oldDirection === '-') sortOrder = 'ASC';
    else if (oldDirection === 'ASC') sortOrder = 'DESC';
    else if (oldDirection === 'DESC') sortOrder = '-';

    // Update the sorting state
    setActiveSorting({
      citations: '-',
      hindex: '-',
      i_ten_index: '-',
      impact_factor: '-',
      age: '-',
      years_in_field: '-',
      [name]: sortOrder,
    });

    // Create the sorting sequence string
    let finalSequence = `${name}:${sortOrder}`;
    setSelectedOptions(prevState => ({
      ...prevState,
      sorting_sequence: finalSequence,
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
          {/* Domain dropdown menu */}
          <select className="form-control mr-2" name="domain" value={selectedOptions.domain.id || ''} onChange={handleInputChange}>
            <option value="">Domain</option>
            {dropdownOptions.domains.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Field dropdown menu */}
          <select className="form-control mr-2" name="field" value={selectedOptions.field.id || ''} onChange={handleInputChange}>
            <option value="">Field</option>
            {(Array.isArray(dropdownOptions.fields) ? dropdownOptions.fields : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Subfield dropdown menu */}
          <select className="form-control mr-2" name="subfield" value={selectedOptions.subfield.id || ''} onChange={handleInputChange}>
            <option value="">Subfield</option>
            {(Array.isArray(dropdownOptions.subfields) ? dropdownOptions.subfields : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Topic dropdown menu */}
          <select className="form-control mr-2" name="topic" value={selectedOptions.topic.id || ''} onChange={handleInputChange}>
            <option value="">Topic</option>
            {(Array.isArray(dropdownOptions.topics) ? dropdownOptions.topics : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
  
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Continent dropdown menu */}
          <select className="form-control mr-2" name="continent" value={selectedOptions.continent.id || ''} onChange={handleInputChange}>
            <option value="">Continent</option>
            {dropdownOptions.continents.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Region dropdown menu */}
          <select className="form-control mr-2" name="region" value={selectedOptions.region.id || ''} onChange={handleInputChange}>
            <option value="">Region</option>
            {(Array.isArray(dropdownOptions.regions) ? dropdownOptions.regions : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Subregion dropdown menu */}
          <select className="form-control mr-2" name="subregion" value={selectedOptions.subregion.id || ''} onChange={handleInputChange}>
            <option value="">Subregion</option>
            {(Array.isArray(dropdownOptions.subregions) ? dropdownOptions.subregions : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
  
          {/* Country dropdown menu */}
          <select className="form-control mr-2" name="country" value={selectedOptions.country.id || ''} onChange={handleInputChange}>
            <option value="">Country</option>
            {(Array.isArray(dropdownOptions.countries) ? dropdownOptions.countries : []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
  
        <div className="dropdown-container d-flex align-items-center mt-4">
          {/* Institution text input */}
          <input
            type="text"
            className="form-control mr-2"
            name="institution"
            value={selectedOptions.institution}
            onChange={handleInputChange}
            placeholder="Enter Institution(s)"
          />
        </div>
  
        <div className="dropdown-container d-flex align-items-center mt-4">
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
  
        {/* Sorting dropdown */}
        <div className="dropdown-container d-flex align-items-center mt-4">
          <select className="form-control mr-2" name="sorting" value={selectedOptions.sorting || ''} onChange={handleSortingChange}>
            <option value="">Sort by</option>
            <option value="citations_asc">Citations (Ascending)</option>
            <option value="citations_desc">Citations (Descending)</option>
            <option value="hindex_asc">H-Index (Ascending)</option>
            <option value="hindex_desc">H-Index (Descending)</option>
            <option value="i10index_asc">i10-Index (Ascending)</option>
            <option value="i10index_desc">i10-Index (Descending)</option>
            <option value="impact_factor_asc">Impact Factor (Ascending)</option>
            <option value="impact_factor_desc">Impact Factor (Descending)</option>
            <option value="age_asc">Age (Ascending)</option>
            <option value="age_desc">Age (Descending)</option>
            <option value="years_in_field_asc">Years in Field (Ascending)</option>
            <option value="years_in_field_desc">Years in Field (Descending)</option>
          </select>
        </div>
  
        {searchResults.length > 0 && (
          <div className="mt-4">
            <button className="btn clear-sorting-button" onClick={handleClearSortingSelection}>Clear Sorting Selections</button>
            <button className="btn download-button" onClick={handleDownloadCSV}>Download CSV</button>
            <button className="btn download-button" onClick={handleDownloadPDF}>Download PDF</button>
            <div className="sorting-order">
              <p>Sorting order: {selectedOptions.sorting_sequence}</p>
            </div>
            <div className="search-results mt-4">
              <div className="row">
                {searchResults.map(result => (
                  <div className="col-md-4 mb-4" key={result.id}>
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{result.name}</h5>
                        <p className="card-text"><strong>Field of Study:</strong> {result.field_of_study}</p>
                        <p className="card-text"><strong>Institution:</strong> {result.institution}</p>
                        <p className="card-text"><strong>Region:</strong> {result.region}</p>
                        <p className="card-text"><strong>Citations:</strong> {result.citations}</p>
                        <p className="card-text"><strong>H-Index:</strong> {result.hindex}</p>
                        <p className="card-text"><strong>i10-Index:</strong> {result.i_ten_index}</p>
                        <p className="card-text"><strong>Impact Factor:</strong> {result.impact_factor}</p>
                        <p className="card-text"><strong>Age:</strong> {result.age}</p>
                        <p className="card-text"><strong>Years in Field:</strong> {result.years_in_field}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Home;

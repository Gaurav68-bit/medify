import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';

//styles
import "./SearchBar.css";

//assets
import searchIcon from "../../assets/search.svg";
import location from "../../assets/location.svg";
import loadingIcon from "../../assets/loading.svg";

//components
import Button from '../Button/Button';
import SearchPop from './SearchPop';

//contexts
import { BookingsContext, FoundHospitalsContext } from '../../contexts/AllContexts';

//API Base URL
const API_BASE = "https://meddata-backend.onrender.com";

const SearchBar = props => {
    const { customClass, atBookingsPage } = props;

    // Contexts
    const [bookings] = useContext(BookingsContext);
    const [foundHospitals, setFoundHospitals] = useContext(FoundHospitalsContext);

    // States
    const [stateName, setStateName] = useState("");
    const [cityName, setCityName] = useState("");

    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    const [disableCityInput, setDisableCityInput] = useState(true);
    const [fetchingCities, setFetchingCities] = useState(false);
    const [fetchingHospitals, setFetchingHospitals] = useState(false);

    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Fetch states when input is focused
    const fetchStates = async () => {
        if (statesList.length === 0) {
            try {
                const response = await axios.get(`${API_BASE}/states`);
                setStatesList(response.data);
                setFilteredStates(response.data);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        } else {
            setFilteredStates(statesList);
        }
        setShowStateDropdown(true);  // Show the dropdown when input is focused
    };

    // Fetch cities when state is selected
    const fetchCities = async (state) => {
        setFetchingCities(true);
        setDisableCityInput(true);
        try {
            const response = await axios.get(`${API_BASE}/cities/${state}`);
            setCitiesList(response.data);
            setFilteredCities(response.data);
            setDisableCityInput(false);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
        setFetchingCities(false);
    };

    // Handle input change
    const handleChange = (event) => {
        const { value, name } = event.target;

        if (name === "state") {
            setStateName(value);
            setFilteredStates(statesList.filter(state => state.toLowerCase().includes(value.toLowerCase())));
            setShowStateDropdown(true);
        }

        if (name === "city") {
            setCityName(value);
            setFilteredCities(citiesList.filter(city => city.toLowerCase().includes(value.toLowerCase())));
            setShowCityDropdown(true);
        }
    };

    // Handle selection of a state from dropdown
    const selectState = (state) => {
        setStateName(state);
        setFilteredStates([]);
        setShowStateDropdown(false);
        fetchCities(state);
    };

    // Handle selection of a city from dropdown
    const selectCity = (city) => {
        setCityName(city);
        setFilteredCities([]);
        setShowCityDropdown(false);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (atBookingsPage) return;

        setFetchingHospitals(true);
        try {
            const response = await axios.get(`${API_BASE}/data?state=${stateName}&city=${cityName}`);
            setFoundHospitals({ hospitals: response.data, cityName, stateName });
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        }
        setFetchingHospitals(false);
    };

    return (
        <form onSubmit={handleSubmit} className={`SearchBar ${customClass}`}>
            {/* State Input */}
            <div className='inputWrapper' id="state">
                <img src={location} />
                <input 
                    type='text' 
                    value={stateName} 
                    name='state' 
                    onChange={handleChange}
                    onFocus={fetchStates}
                    onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
                    placeholder='State'
                    required
                />
                {/* Dropdown for States */}
                {showStateDropdown && filteredStates.length > 0 && (
                    <SearchPop locations={filteredStates} clickFunction={selectState} />
                )}
            </div>

            {/* City Input */}
            <div className={`inputWrapper ${disableCityInput ? "disableCityInput" : ""}`} id="city">
                <img src={fetchingCities ? loadingIcon : location} className={fetchingCities ? 'rotateLoad' : ''} />
                <input 
                    type='text' 
                    value={cityName} 
                    name='city' 
                    onChange={handleChange}
                    onFocus={() => { 
                        if (citiesList.length === 0) fetchCities(stateName);
                        setShowCityDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    placeholder={fetchingCities ? "Fetching cities..." : 'City'}
                    required
                    disabled={disableCityInput}
                />
                {/* Dropdown for Cities */}
                {showCityDropdown && filteredCities.length > 0 && (
                    <SearchPop locations={filteredCities} clickFunction={selectCity} />
                )}
            </div>

            {/* Search Button */}
            <Button 
                formSubmit="true" 
                text={fetchingHospitals ? "Fetching..." : "Search"}
                icon={fetchingHospitals ? loadingIcon : searchIcon} 
                buttonClass={"longButton"}
                rotateIcon={fetchingHospitals}
            />
        </form>
    );
};

export default SearchBar;

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import "./SearchBar.css";
import searchIcon from "../../assets/search.svg";
import locationIcon from "../../assets/location.svg";
import loadingIcon from "../../assets/loading.svg";
import Button from '../Button/Button';
import { BookingsContext, FoundHospitalsContext } from '../../contexts/AllContexts';

const API_BASE = "https://meddata-backend.onrender.com";

const SearchBar = (props) => {
    const { customClass } = props;

    // Contexts
    const [foundHospitals, setFoundHospitals] = useContext(FoundHospitalsContext);

    // States
    const [stateName, setStateName] = useState("");
    const [cityName, setCityName] = useState("");
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [disableCityInput, setDisableCityInput] = useState(true);
    const [fetchingCities, setFetchingCities] = useState(false);
    const [fetchingHospitals, setFetchingHospitals] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Fetch states when the input changes
    useEffect(() => {
        if (stateName) fetchStates();
    }, [stateName]);

    // Fetch cities when the state is selected
    useEffect(() => {
        if (stateName) fetchCities(stateName);
    }, [stateName]);

    // Fetch hospitals when both state and city are selected
    useEffect(() => {
        if (cityName) fetchHospitals();
    }, [cityName]);

    // Fetch all states
    const fetchStates = async () => {
        try {
            const response = await axios.get(`${API_BASE}/states`);
            const states = response.data;
            setFilteredStates(states.filter(state => state.toLowerCase().includes(stateName.toLowerCase())));
            setShowStateDropdown(true); // Show dropdown
            console.log("Fetched States:", states); // Debugging
        } catch (error) {
            console.error("Error fetching states:", error);
        }
    };

    // Fetch cities based on selected state
    const fetchCities = async (selectedState) => {
        setFetchingCities(true);
        try {
            const response = await axios.get(`${API_BASE}/cities/${selectedState}`);
            setFilteredCities(response.data);
            setDisableCityInput(false);
            setShowCityDropdown(true);
            console.log("Fetched Cities:", response.data); // Debugging
        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            setFetchingCities(false);
        }
    };

    // Fetch hospitals based on selected state and city
    const fetchHospitals = async () => {
        setFetchingHospitals(true);
        try {
            const response = await axios.get(`${API_BASE}/data?state=${stateName}&city=${cityName}`);
            setFoundHospitals({ hospitals: response.data, cityName, stateName });
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setFetchingHospitals(false);
        }
    };

    // Handle input changes
    const handleChange = (event) => {
        const { value, name } = event.target;

        if (name === "state") {
            setStateName(value);
            setShowStateDropdown(true);
            setShowCityDropdown(false);
            setCityName("");
        }

        if (name === "city") {
            setCityName(value);
            setShowCityDropdown(true);
        }
    };

    // Select state from dropdown
    const selectState = (state) => {
        setStateName(state);
        setShowStateDropdown(false);
        fetchCities(state);
    };

    // Select city from dropdown
    const selectCity = (city) => {
        setCityName(city);
        setShowCityDropdown(false);
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); fetchHospitals(); }} className={`SearchBar ${customClass}`}>
            {/* State Input & Dropdown */}
            <span className="inputWrapper">
                <img src={locationIcon} alt="location"/>
                <input
                    type="text"
                    value={stateName}
                    name="state"
                    onChange={handleChange}
                    placeholder="State"
                    required
                    onFocus={() => setShowStateDropdown(true)}
                />
                {showStateDropdown && filteredStates.length > 0 && (
                    <ul className="dropdown-list">
                        {filteredStates.map((state, index) => (
                            <li key={index} onClick={() => selectState(state)}>
                                {state}
                            </li>
                        ))}
                    </ul>
                )}
            </span>

            {/* City Input & Dropdown */}
            <span className={`inputWrapper ${disableCityInput ? "disabled" : ""}`}>
                <img src={fetchingCities ? loadingIcon : locationIcon} className={fetchingCities ? "rotateLoad" : null}/>
                <input
                    type="text"
                    value={cityName}
                    name="city"
                    onChange={handleChange}
                    placeholder={fetchingCities ? "Fetching cities..." : "City"}
                    required
                    disabled={disableCityInput}
                    onFocus={() => setShowCityDropdown(true)}
                />
                {showCityDropdown && filteredCities.length > 0 && (
                    <ul className="dropdown-list">
                        {filteredCities.map((city, index) => (
                            <li key={index} onClick={() => selectCity(city)}>
                                {city}
                            </li>
                        ))}
                    </ul>
                )}
            </span>

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

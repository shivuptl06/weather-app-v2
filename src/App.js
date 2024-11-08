import "./App.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import clear from "./icons/clear.png";
import cloud from "./icons/cloud.png";
import drizzle from "./icons/drizzle.png";
import rain from "./icons/rain.png";
import snow from "./icons/snow.png";
import windIcon from "./icons/wind.png"; // Wind icon
import humidityIcon from "./icons/humidity.png"; // Humidity icon

function App() {
  const API_KEY = "46647644-a5ca1c401d94abe9622557302";
  const OpenWeatherAPI_KEY = "cd72cecc6033636d9a71e2bec98fbc65";

  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const API_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
      "weather outside"
    )}&image_type=photo`;

    const fetchImages = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.hits.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * response.data.hits.length
          );
          setImages(response.data.hits[randomIndex].largeImageURL);
        } else {
          console.log("No images found");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchImages();

    //const intervalID = setInterval(fetchImages, 10000);
    //return () => clearInterval(intervalID);
  }, []);

  const handleInputChange = async (inputValue) => {
    setSearchTerm(inputValue);

    if (inputValue.length >= 3) {
      const fetchGeoCoordinates_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        inputValue
      )}&limit=5&appid=${OpenWeatherAPI_KEY}`;

      try {
        const response = await axios.get(fetchGeoCoordinates_URL);
        if (response.data.length > 0) {
          const options = response.data.map((city) => ({
            label: `${city.name}, ${city.country}`,
            value: { lat: city.lat, lon: city.lon, name: city.name },
          }));
          setCityOptions(options);
        } else {
          setCityOptions([]);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setCityOptions([]);
    }
  };

  const handleCitySelect = async (selectedOption) => {
    const { lat, lon, name } = selectedOption.value;
    setSearchTerm(name); // Keep city name in the input field

    const OpenWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OpenWeatherAPI_KEY}`;

    try {
      const response = await axios.get(OpenWeatherURL);
      if (response.data.weather) {
        setWeatherData({ ...response.data, name }); // Store city name as well
        const weatherDescription = response.data.weather[0].main.toLowerCase();

        // Set the appropriate weather icon based on the weather description
        switch (weatherDescription) {
          case "clear":
            setWeatherIcon(clear);
            break;
          case "clouds":
            setWeatherIcon(cloud);
            break;
          case "drizzle":
            setWeatherIcon(drizzle);
            break;
          case "rain":
            setWeatherIcon(rain);
            break;
          case "snow":
            setWeatherIcon(snow);
            break;
          default:
            setWeatherIcon("https://openweathermap.org/img/wn/01d.png"); // Default icon from OpenWeather API
            break;
        }
      } else {
        console.log("No weather data available");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const convertKelvin = (temperatureKelvin) => {
    const temperatureCelsius = temperatureKelvin - 273.15;
    return Math.round(temperatureCelsius); // Using Math.round for temperature
  };

  return (
    <div className="App">
      <div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${images})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-4/5 xl:w-1/3 h-auto flex flex-col bg-opacity-70 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 rounded-3xl shadow-lg p-8 items-center card-container">
          <h1 className="text-3xl text-white font-bold mb-4">Weather Finder</h1>
          <Select
            inputValue={searchTerm}
            onInputChange={handleInputChange}
            options={cityOptions}
            onChange={handleCitySelect}
            placeholder="Search City, Country"
            noOptionsMessage={() => "No cities found"}
            className="w-full p-2 rounded-md mb-4"
            styles={{
              control: (base) => ({
                ...base,
                border: "2px solid #4f4f4f",
                borderRadius: "0.75rem",
                padding: "0.5rem",
                backgroundColor: "#fff",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.75rem",
                backgroundColor: "#f0f0f0",
              }),
            }}
          />
          <div className="text-center text-white mt-4 flex flex-col">
            {weatherIcon && (
              <img
                src={weatherIcon}
                alt="Weather Icon"
                className="rounded-md mt-2 mb-4 items-center justify-center"
              />
            )}
            {weatherData.main && (
              <>
                <span className="block text-5xl font-poppins font-bold">
                  {convertKelvin(weatherData.main.temp)}°C
                </span>
                <span className="block text-2xl font-light p-1">
                  {weatherData.name}
                </span>
              </>
            )}
            {weatherData.main && (
              <div className="mt-8 w-full flex justify-between items-center space-x-10">
                <div className="flex items-center text-xl">
                  <img
                    src={humidityIcon}
                    alt="Humidity"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    Humidity: {Math.round(weatherData.main.humidity)}%
                  </span>
                </div>
                <div className="flex items-center text-xl">
                  <img
                    src={windIcon}
                    alt="Wind Speed"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    Wind Speed: {Math.round(weatherData.wind.speed)} m/s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// Open-Meteo tutorial /inspiration: https://www.youtube.com/watch?v=HS7GfTuJgA8
// Open-Meteo docs: https://open-meteo.com/en/docs

//Weather icons MIT License Copyright (c) 2020-2024 Bas Milius: https://github.com/basmilius/weather-icons?tab=readme-ov-file
// I used this to download weather icons from the above repository: https://download-directory.github.io/

//rounding numbers: //https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript 

//modifying date objects: https://stackoverflow.com/questions/29042911/how-do-i-split-the-date-and-time-into-two-elements

// celsius to fahrenheit: https://thoughtbot.com/blog/convert-fahrenheit-and-celsius-the-easy-way


//minimizing api calls 
const Weather_Temperature={
     current_temperature: null,
     weekly_temperatureMax:[],
     weekly_temperatureMin:[],
     unit: "°C"     // default
}

let weather = null;

async function getLocation(location) {
    const res= await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`)
    const data =await res.json()
    const result= data.results[0]

    return{
        name: result.name || "",
        latitude: result.latitude,
        longitude: result.longitude
    }
}

async function getWeather(location){
     const {latitude, longitude, name} = await getLocation(location);
     const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
     const data = await res.json();
     //console.log(data)
     return {
          name,
          current: data.current,
          daily: data.daily
     }
}


function displayMeteoWeather(data){
    document.getElementById("municipality").textContent =" 7 days weather in "+ data.name;
    
    const {temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m} = data.current


    const weatherData = document.getElementById("weather-data");
    weatherData.innerHTML=""

     //current weather
     const currentWeatherBox= document.getElementById("current-weather")

     
     const humidity=data.current.relative_humidity_2m
     const currentTemp=data.current.temperature_2m  //default: celsius
     const currentTime=data.current.time
     const currentCode=data.current.weather_code
     const currentWind=(data.current.wind_speed_10m / 3.6).toFixed(1) // comes km/h and I want it to be m/s
     
     if(Weather_Temperature.unit==="°C"){
          Weather_Temperature.current_temperature=currentTemp    
     }
     else if(Weather_Temperature.unit==="K"){
          Weather_Temperature.current_temperature=currentTemp+273.15
     }
     else if(Weather_Temperature.unit==="°F"){
          Weather_Temperature.current_temperature=currentTemp*2 +30
     }
     
     //Weather_Temperature.current_temperature=currentTemp //Saving the current temperature if it needs to be converted to K or F

     const time= new Date(currentTime)
     time.setHours(time.getHours()+2) //The original time is Berlin time so I had to convert it to Finnish time

     // The time is not accurate always.
     const formattedTime = time.toLocaleString("en", {
          weekday: "long",
          hour: "numeric",
          timeZone: "Europe/Helsinki"
     })
    
     const weatherCondition = weather_codes[currentCode]
     const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`

     currentWeatherBox.innerHTML = `
     <div class="current-weather-info">
          <h3>Current weather in ${data.name}</h3>
          <p class="basic-font">${formattedTime}</p> 
          <img src="${imgSrc}" alt="weather-icon" width="100" height="100"/ title="${weatherCondition.name}">
          <p class="basic-font">${weatherCondition.name}</p>
          <p class="basic-font">Temperature: ${Weather_Temperature.current_temperature.toFixed(1)} ${Weather_Temperature.unit}</p>
          <div class="basic-font">Humidity: ${humidity} %</div>
          <p class="basic-font">Wind speed: ${currentWind} m/s</p>
     </div>
  `;


    //week info
    for(let i=0; i<7; i++){

          const weekday= data.daily.time[i]
          
          const time= new Date(weekday)
          // Using fi because I wanted day before month
          const formattedWeekday = time.toLocaleString("fi", {
          month: "2-digit",
          day: "2-digit"
          
          
          })
          const code= data.daily.weather_code[i]

          let max;
          let min;
          if(Weather_Temperature.unit==="°C"){
               max=data.daily.temperature_2m_max[i]
               min= data.daily.temperature_2m_min[i]

               Weather_Temperature.weekly_temperatureMax[i]=max
               Weather_Temperature.weekly_temperatureMin[i]=min
          
          } else if(Weather_Temperature.unit==="K"){
               max=Weather_Temperature.weekly_temperatureMax[i]+273.15
               min=Weather_Temperature.weekly_temperatureMin[i]+273.15
          }
          else if(Weather_Temperature.unit==="°F"){
               max=Weather_Temperature.weekly_temperatureMax[i]*2 +30
               min=Weather_Temperature.weekly_temperatureMin[i]*2 +30
               
          }

          

          const weatherCondition = weather_codes[code]

          const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`
        
          const row = document.createElement("div");
          row.classList.add("weather-row");
          row.innerHTML= `
          <div class="day">${formattedWeekday} </div>
          <div class="weather-info">
               <img src="${imgSrc}" alt="weather-icon" width="100" height="100" title="${weatherCondition.name}"/>
               <div class="basic-font">${weatherCondition.name}</div>
               <div class="maximumTemperatute" title="Highest temperature of the day">${max.toFixed(1)} ${Weather_Temperature.unit}</div>
               <div class="minimumTemperatute" title="Lowest temperature of the day">${min.toFixed(1)} ${Weather_Temperature.unit}</div>
          </div>
          `;

        weatherData.appendChild(row);
    }
    
}

     document.getElementById("submit-data").addEventListener("click", async()=> {
          const location= document.getElementById("input-area").value
   
          try{
               weather=await getWeather(location)
               displayMeteoWeather(weather)

               document.querySelector(".weather-box2").classList.add("show")
               document.querySelector(".weather-box").classList.add("show")
          } catch(err){
               console.log("Error: ",err)
          }
     })

//change temperatures to kelvin
document.getElementById("kelvin").addEventListener("click", ()=> {
     Weather_Temperature.unit= "K"
    displayMeteoWeather(weather)
})
//change temperatures to fahrenheit
document.getElementById("fahrenheit").addEventListener("click", ()=> {
     Weather_Temperature.unit= "°F"
    displayMeteoWeather(weather)
})
//change temperatures to celsius
document.getElementById("celsius").addEventListener("click", ()=> {
     Weather_Temperature.unit= "°C"
    displayMeteoWeather(weather)
})



//Weather codes: https://open-meteo.com/en/docs#weather_variable_documentation
//this type of structure was used in this video so I decided to use it: https://www.youtube.com/watch?v=HS7GfTuJgA8
const weather_codes = {
     0: {
          name: "Clear Sky",
          icons: {
               day: "clear-day.svg",
               night: "clear-night.svg"
          }
     },
     1: {
          name: "Mainly Clear",
          icons: {
               day: "clear-day.svg",
               night: "clear-night.svg"
          }
     },
     2: {
          name: "Partly Cloudy",
          icons: {
               day: "partly-cloudy-day.svg",
               night: "partly-cloudy-night.svg"
          }
     },
     3: {
          name: "Overcast",
          icons: {
               day: "overcast.svg",
               night: "overcast-night.svg"
          }
     },
     45: {
          name: "Fog",
          icons: {
               day: "fog-day.svg",
               night: "fog-night.svg"
          }
     },
     48: {
          name: "Rime Fog",
          icons: {
               day: "fog.svg",
               night: "fog.svg"
          }
     },
     51: {
          name: "Light Drizzle",
          icons: {
               day: "drizzle.svg",
               night: "drizzle.svg"
          }
     },
     //moderate drizzle not found
     53: {
          name: "Moderate Drizzle",
          icons: {
               day: "drizzle.svg",
               night: "drizzle.svg"
          }
     },
     55: {
          name: "Heavy Drizzle",
          icons: {
               day: "extreme-drizzle.svg",
               night: "extreme-night-drizzle.svg"
          }
     },
     //Light Freezing Drizzle not found
     56: {
          name: "Light Freezing Drizzle",
          icons: {
               day: "drizzle.svg",
               night: "drizzle.svg"
          }
     },
     //Dense Freezing Drizzle not found
     57: {
          name: "Dense Freezing Drizzle",
          icons: {
               day: "extreme-drizzle.svg",
               night: "extreme-night-drizzle.svg"
          }
     },
     61: {
          name: "Slight Rain",
          icons: {
               day: "slight-rain.svg",
               night: "slight-rain-night.svg"
          }
     },
     63: {
          name: "Moderate Rain",
          icons: {
               day: "rain.svg",
               night: "rain.svg"
          }
     },
     65: {
          name: "Heavy Rain",
          icons: {
               day: "extreme-rain.svg",
               night: "extreme-night-rain.svg"
          }
     },
     66: {
          name: "Light Freezing Rain",
          icons: {
               day: "rain.svg",
               night: "rain.svg"
          }
     },
     //Heavy Freezing Rain not found
     67: {
          name: "Heavy Freezing Rain",
          icons: {
               day: "extreme-rain.svg",
               night: "extreme-night-rain.svg"
          }
     },
     71: {
          name: "Slight snowfall",
          icons: {
               day: "partly-cloudy-day-snow.svg",
               night: "partly-cloudy-night-snow.svg"
          }
     },
     73: {
          name: "Moderate snowfall",
          icons: {
               day: "extreme-day-snow.svg",
               night: "extreme-night-snow.svg"
          }
     },
     75: {
          name: "Heavy snowfall",
          icons: {
               day: "extreme-snow.svg",
               night: "extreme-snow.svg"
          }
     },
     //this should be close enough
     77: {
          name: "Snow Grains",
          icons: {
               day: "snowflake.svg",
               night: "snowflake.svg"
          }
     },
     80: {
          name: "Slight Rain Showers",
          icons: {
               day: "thunderstorms-day-rain.svg",
               night: "thunderstorms-night-rain.svg"
          }
     },
     //not the best option
     81: {
          name: "Moderate Rain Showers",
          icons: {
               day: "thunderstorms-rain.svg",
               night: "thunderstorms-rain.svg"
          }
     },
     82: {
          name: "Violent Rain Showers",
          icons: {
               day: "thunderstorms-extreme-rain.svg",
               night: "thunderstorms-extreme-rain.svg"
          }
     },
     //just snow
     85: {
          name: "Light Snow Showers",
          icons: {
               day: "snow.svg",
               night: "snow.svg"
          }
     },
     86: {
          name: "Heavy Snow Showers",
          icons: {
               day: "extreme-day-snow.svg",
               night: "extreme-night-snow.svg"
          }
     },
     95: {
          name: "Thunderstorm",
          icons: {
               day: "thunderstorms-extreme.svg",
               night: "thunderstorms-extreme.svg"
          }
     },
     96: {
          name: "Slight Hailstorm",
          icons: {
               day: "hail.svg",
               night: "hail.svg"
          }
     },
     99: {
          name: "Heavy Hailstorm",
          icons: {
               day: "heavy-day-hail.svg",
               night: "heavy-night-hail.svg"
          }
     }
};


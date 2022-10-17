import type {Result} from './Result';
import {success, failure} from './Result';
import {ONE_MINUTE} from './constants';

interface Cache<T> {
  fetchedAt: number;
  value: T;
}

export type Main =
  | 'Ash'
  | 'Clear'
  | 'Clouds'
  | 'Drizzle'
  | 'Dust'
  | 'Fog'
  | 'Haze'
  | 'Mist'
  | 'Rain'
  | 'Sand'
  | 'Smoke'
  | 'Snow'
  | 'Squall'
  | 'Thunderstorm'
  | 'Tornado';

export interface WeatherResponse {
  main: Main;
  description: string;
  icon: string;
}

interface WeatherAPI {
  base: string;
  clouds: {
    all: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
  dt: number;
  main: {
    feels_like: number;
    humidity: number;
    pressure: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  visibility: number;
  weather: WeatherResponse[];
  wind: {
    deg: number;
    speed: number;
  };
}

function fetchCurrentWeatherUrl(latitude: number, longitude: number) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=fd4e1396bfa709f4d9c47cb4b1368c23`;
}

let weatherCache: Cache<WeatherAPI> | undefined = undefined;
export async function fetchCurrentWeather({
  now,
  latitude,
  longitude,
}: {
  now: number;
  latitude: number;
  longitude: number;
}): Promise<Result<WeatherAPI>> {
  if (weatherCache && now - weatherCache.fetchedAt < 5 * ONE_MINUTE) {
    return Promise.resolve(success(weatherCache.value));
  } else {
    weatherCache = undefined;
  }
  const url = fetchCurrentWeatherUrl(latitude, longitude);

  return fetch(url)
    .then(response => response.json())
    .then(json => {
      console.log(JSON.stringify(json));
      return json;
    })
    .then(json => success(json))
    .catch(() => failure(new Error()));
}

function oneCallUrl(latitude: number, longitude: number) {
  return `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=fd4e1396bfa709f4d9c47cb4b1368c23&exclude=minutely,alerts`;
}

export interface OneCallAPI {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: string;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    weather: WeatherResponse[];
  };
  hourly: {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    weather: WeatherResponse[];
  }[];
  daily: {
    dt: number;
    temp: {
      min: number;
      max: number;
      morn: number;
      day: number;
      eve: number;
      night: number;
    };
    feels_like: number;
    pressure: number;
    humidity: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    weather: WeatherResponse[];
  }[];
}

let oneCallCache: Cache<OneCallAPI> | undefined = undefined;
export async function fetchOneCall({
  latitude,
  longitude,
  now,
}: {
  latitude: number;
  longitude: number;
  now: number;
}): Promise<Result<OneCallAPI>> {
  if (oneCallCache && now - oneCallCache.fetchedAt < 5 * ONE_MINUTE) {
    return Promise.resolve(success(oneCallCache.value));
  } else {
    oneCallCache = undefined;
  }
  const url = oneCallUrl(latitude, longitude);

  console.log('=============== Weather.tsx at line 292 ===============');
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      oneCallCache = {
        fetchedAt: now,
        value: json,
      };
      return json;
    })
    .then(json => success(json))
    .catch(() => failure(new Error()));
  //   const json: OneCallAPI = JSON.parse(`
  //   {"lat":${latitude},"lon":${longitude},"timezone":"America/Toronto","timezone_offset":-14400,"current":{"dt":1665885548,"sunrise":1665833702,"sunset":1665873553,"temp":278.87,"feels_like":275.86,"pressure":1015,"humidity":71,"dew_point":274.03,"uvi":0,"clouds":69,"visibility":10000,"wind_speed":4.06,"wind_deg":227,"wind_gust":13,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}]},"hourly":[{"dt":1665882000,"temp":278.85,"feels_like":276.27,"pressure":1015,"humidity":68,"dew_point":273.41,"uvi":0,"clouds":70,"visibility":10000,"wind_speed":3.34,"wind_deg":221,"wind_gust":10.03,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665885600,"temp":278.87,"feels_like":275.86,"pressure":1015,"humidity":71,"dew_point":274.03,"uvi":0,"clouds":69,"visibility":10000,"wind_speed":4.06,"wind_deg":227,"wind_gust":13,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665889200,"temp":278.9,"feels_like":275.89,"pressure":1015,"humidity":68,"dew_point":273.46,"uvi":0,"clouds":65,"visibility":10000,"wind_speed":4.08,"wind_deg":242,"wind_gust":12.27,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665892800,"temp":278.51,"feels_like":275.92,"pressure":1015,"humidity":68,"dew_point":273.09,"uvi":0,"clouds":58,"visibility":10000,"wind_speed":3.24,"wind_deg":238,"wind_gust":11.23,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665896400,"temp":278.07,"feels_like":275.44,"pressure":1014,"humidity":68,"dew_point":272.72,"uvi":0,"clouds":49,"visibility":10000,"wind_speed":3.16,"wind_deg":239,"wind_gust":10.41,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"pop":0},{"dt":1665900000,"temp":277.6,"feels_like":274.97,"pressure":1014,"humidity":68,"dew_point":272.33,"uvi":0,"clouds":39,"visibility":10000,"wind_speed":3.03,"wind_deg":236,"wind_gust":7.96,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"pop":0},{"dt":1665903600,"temp":277.1,"feels_like":274.41,"pressure":1014,"humidity":68,"dew_point":271.67,"uvi":0,"clouds":11,"visibility":10000,"wind_speed":2.98,"wind_deg":231,"wind_gust":6.63,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"pop":0},{"dt":1665907200,"temp":276.98,"feels_like":274.23,"pressure":1014,"humidity":69,"dew_point":271.57,"uvi":0,"clouds":15,"visibility":10000,"wind_speed":3.03,"wind_deg":224,"wind_gust":6.4,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"pop":0},{"dt":1665910800,"temp":276.97,"feels_like":274.2,"pressure":1014,"humidity":68,"dew_point":271.51,"uvi":0,"clouds":16,"visibility":10000,"wind_speed":3.05,"wind_deg":225,"wind_gust":7.26,"weather":[{"id":801,"main":"Clouds","description":"few clouds","icon":"02n"}],"pop":0},{"dt":1665914400,"temp":277.25,"feels_like":274.59,"pressure":1014,"humidity":67,"dew_point":271.51,"uvi":0,"clouds":32,"visibility":10000,"wind_speed":2.98,"wind_deg":224,"wind_gust":8.25,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"pop":0},{"dt":1665918000,"temp":277.65,"feels_like":275.02,"pressure":1014,"humidity":65,"dew_point":271.59,"uvi":0,"clouds":43,"visibility":10000,"wind_speed":3.05,"wind_deg":228,"wind_gust":9.75,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"pop":0},{"dt":1665921600,"temp":278.27,"feels_like":275.52,"pressure":1014,"humidity":64,"dew_point":271.81,"uvi":0,"clouds":48,"visibility":10000,"wind_speed":3.41,"wind_deg":225,"wind_gust":10.64,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"pop":0},{"dt":1665925200,"temp":280.83,"feels_like":278.24,"pressure":1013,"humidity":57,"dew_point":272.8,"uvi":0.23,"clouds":71,"visibility":10000,"wind_speed":4.12,"wind_deg":220,"wind_gust":11.48,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665928800,"temp":283.75,"feels_like":282.17,"pressure":1012,"humidity":50,"dew_point":273.61,"uvi":0.77,"clouds":55,"visibility":10000,"wind_speed":5.97,"wind_deg":225,"wind_gust":10.93,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665932400,"temp":285.85,"feels_like":284.27,"pressure":1011,"humidity":42,"dew_point":273.21,"uvi":1.58,"clouds":43,"visibility":10000,"wind_speed":6.7,"wind_deg":228,"wind_gust":9.91,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"pop":0},{"dt":1665936000,"temp":287.18,"feels_like":285.66,"pressure":1011,"humidity":39,"dew_point":273.29,"uvi":1.96,"clouds":49,"visibility":10000,"wind_speed":6.86,"wind_deg":236,"wind_gust":9.81,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"pop":0},{"dt":1665939600,"temp":286.74,"feels_like":285.23,"pressure":1010,"humidity":41,"dew_point":273.68,"uvi":2.34,"clouds":59,"visibility":10000,"wind_speed":6.54,"wind_deg":246,"wind_gust":9.13,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665943200,"temp":287.02,"feels_like":285.53,"pressure":1010,"humidity":41,"dew_point":273.96,"uvi":2.28,"clouds":66,"visibility":10000,"wind_speed":5.93,"wind_deg":249,"wind_gust":8.53,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665946800,"temp":287.91,"feels_like":286.46,"pressure":1009,"humidity":39,"dew_point":273.96,"uvi":1.68,"clouds":76,"visibility":10000,"wind_speed":5.96,"wind_deg":247,"wind_gust":8.6,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665950400,"temp":287.75,"feels_like":286.28,"pressure":1009,"humidity":39,"dew_point":273.93,"uvi":1.03,"clouds":68,"visibility":10000,"wind_speed":5.96,"wind_deg":254,"wind_gust":8.26,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665954000,"temp":286.7,"feels_like":285.29,"pressure":1009,"humidity":45,"dew_point":274.82,"uvi":0.46,"clouds":63,"visibility":10000,"wind_speed":5.42,"wind_deg":270,"wind_gust":7.57,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665957600,"temp":284.1,"feels_like":282.77,"pressure":1009,"humidity":58,"dew_point":275.86,"uvi":0.04,"clouds":71,"visibility":10000,"wind_speed":4.97,"wind_deg":298,"wind_gust":7.67,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0},{"dt":1665961200,"temp":282.56,"feels_like":280.4,"pressure":1009,"humidity":63,"dew_point":275.62,"uvi":0,"clouds":76,"visibility":10000,"wind_speed":4.05,"wind_deg":298,"wind_gust":8.49,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665964800,"temp":282.1,"feels_like":280.06,"pressure":1009,"humidity":66,"dew_point":275.83,"uvi":0,"clouds":80,"visibility":10000,"wind_speed":3.61,"wind_deg":291,"wind_gust":7.45,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.02},{"dt":1665968400,"temp":281.68,"feels_like":279.63,"pressure":1009,"humidity":70,"dew_point":276.26,"uvi":0,"clouds":100,"visibility":10000,"wind_speed":3.46,"wind_deg":288,"wind_gust":6.9,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"pop":0.1},{"dt":1665972000,"temp":281.3,"feels_like":280.06,"pressure":1008,"humidity":73,"dew_point":276.63,"uvi":0,"clouds":99,"visibility":10000,"wind_speed":2.15,"wind_deg":268,"wind_gust":4.62,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"pop":0.07},{"dt":1665975600,"temp":279.57,"feels_like":277.83,"pressure":1008,"humidity":82,"dew_point":276.4,"uvi":0,"clouds":88,"visibility":10000,"wind_speed":2.38,"wind_deg":251,"wind_gust":3.25,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"pop":0.03},{"dt":1665979200,"temp":278.05,"feels_like":275.59,"pressure":1007,"humidity":87,"dew_point":275.84,"uvi":0,"clouds":75,"visibility":10000,"wind_speed":2.93,"wind_deg":241,"wind_gust":4.88,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0},{"dt":1665982800,"temp":277.23,"feels_like":274.52,"pressure":1007,"humidity":86,"dew_point":274.95,"uvi":0,"clouds":71,"visibility":10000,"wind_speed":3.04,"wind_deg":239,"wind_gust":7.66,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.03},{"dt":1665986400,"temp":276.74,"feels_like":273.84,"pressure":1006,"humidity":87,"dew_point":274.59,"uvi":0,"clouds":68,"visibility":10000,"wind_speed":3.16,"wind_deg":247,"wind_gust":8.68,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.06},{"dt":1665990000,"temp":276.66,"feels_like":273.46,"pressure":1005,"humidity":89,"dew_point":274.88,"uvi":0,"clouds":86,"visibility":10000,"wind_speed":3.56,"wind_deg":245,"wind_gust":9.38,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"pop":0.08},{"dt":1665993600,"temp":276.79,"feels_like":273.27,"pressure":1005,"humidity":91,"dew_point":275.33,"uvi":0,"clouds":86,"visibility":10000,"wind_speed":4.12,"wind_deg":247,"wind_gust":9.92,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04n"}],"pop":0.06},{"dt":1665997200,"temp":276.21,"feels_like":272.43,"pressure":1005,"humidity":95,"dew_point":275.29,"uvi":0,"clouds":76,"visibility":10000,"wind_speed":4.33,"wind_deg":245,"wind_gust":10.39,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.08},{"dt":1666000800,"temp":275.99,"feels_like":272.06,"pressure":1004,"humidity":95,"dew_point":275.05,"uvi":0,"clouds":71,"visibility":10000,"wind_speed":4.5,"wind_deg":243,"wind_gust":10.46,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.08},{"dt":1666004400,"temp":276.13,"feels_like":272.11,"pressure":1004,"humidity":91,"dew_point":274.59,"uvi":0,"clouds":71,"visibility":10000,"wind_speed":4.71,"wind_deg":245,"wind_gust":10.75,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.06},{"dt":1666008000,"temp":276.17,"feels_like":271.97,"pressure":1004,"humidity":89,"dew_point":274.33,"uvi":0,"clouds":75,"visibility":10000,"wind_speed":5.07,"wind_deg":247,"wind_gust":11.2,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.06},{"dt":1666011600,"temp":277.64,"feels_like":273.28,"pressure":1003,"humidity":75,"dew_point":273.45,"uvi":0.11,"clouds":83,"visibility":10000,"wind_speed":6.29,"wind_deg":249,"wind_gust":10.53,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.1},{"dt":1666015200,"temp":278.58,"feels_like":274.02,"pressure":1003,"humidity":61,"dew_point":271.44,"uvi":0.35,"clouds":91,"visibility":10000,"wind_speed":7.58,"wind_deg":250,"wind_gust":10.54,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"pop":0.2},{"dt":1666018800,"temp":279.67,"feels_like":275.24,"pressure":1002,"humidity":54,"dew_point":270.81,"uvi":0.7,"clouds":90,"visibility":10000,"wind_speed":8.2,"wind_deg":251,"wind_gust":10.65,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"pop":0.2},{"dt":1666022400,"temp":280.09,"feels_like":275.7,"pressure":1002,"humidity":56,"dew_point":271.68,"uvi":1.46,"clouds":86,"visibility":10000,"wind_speed":8.51,"wind_deg":251,"wind_gust":10.74,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"pop":0.23},{"dt":1666026000,"temp":280.39,"feels_like":276.15,"pressure":1002,"humidity":52,"dew_point":271.02,"uvi":1.74,"clouds":82,"visibility":10000,"wind_speed":8.29,"wind_deg":251,"wind_gust":10.39,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.23},{"dt":1666029600,"temp":279.44,"feels_like":274.9,"pressure":1002,"humidity":63,"dew_point":272.67,"uvi":1.69,"clouds":84,"visibility":10000,"wind_speed":8.34,"wind_deg":258,"wind_gust":11.37,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.23},{"dt":1666033200,"temp":279.71,"feels_like":275.31,"pressure":1002,"humidity":57,"dew_point":271.5,"uvi":1.16,"clouds":95,"visibility":10000,"wind_speed":8.12,"wind_deg":259,"wind_gust":11.16,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"pop":0.41},{"dt":1666036800,"temp":280.49,"feels_like":276.22,"pressure":1001,"humidity":48,"dew_point":269.96,"uvi":0.72,"clouds":84,"visibility":10000,"wind_speed":8.5,"wind_deg":262,"wind_gust":11.06,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.51},{"dt":1666040400,"temp":279.68,"feels_like":275.38,"pressure":1002,"humidity":56,"dew_point":271.3,"uvi":0.33,"clouds":89,"visibility":10000,"wind_speed":7.76,"wind_deg":258,"wind_gust":10.51,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"pop":0.56,"rain":{"1h":0.13}},{"dt":1666044000,"temp":278.5,"feels_like":274.31,"pressure":1002,"humidity":58,"dew_point":270.78,"uvi":0.11,"clouds":77,"visibility":10000,"wind_speed":6.46,"wind_deg":255,"wind_gust":10.67,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"pop":0.4},{"dt":1666047600,"temp":277.24,"feels_like":273.16,"pressure":1002,"humidity":58,"dew_point":269.57,"uvi":0,"clouds":72,"visibility":10000,"wind_speed":5.39,"wind_deg":248,"wind_gust":10.78,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.36},{"dt":1666051200,"temp":276.96,"feels_like":272.75,"pressure":1002,"humidity":56,"dew_point":268.81,"uvi":0,"clouds":75,"visibility":10000,"wind_speed":5.51,"wind_deg":246,"wind_gust":11.21,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"pop":0.3}],"daily":[{"dt":1665853200,"sunrise":1665833702,"sunset":1665873553,"moonrise":1665886140,"moonset":1665855780,"moon_phase":0.69,"temp":{"day":283.41,"min":278.85,"max":286.28,"night":278.9,"eve":280.35,"morn":285.88},"feels_like":{"day":281.69,"night":275.89,"eve":277.23,"morn":284.44},"pressure":1010,"humidity":46,"dew_point":271.94,"wind_speed":9.72,"wind_deg":258,"wind_gust":17.93,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"clouds":78,"pop":1,"rain":3.35,"uvi":2.72},{"dt":1665939600,"sunrise":1665920175,"sunset":1665959855,"moonrise":1665975780,"moonset":1665945240,"moon_phase":0.72,"temp":{"day":286.74,"min":276.97,"max":287.91,"night":279.57,"eve":282.56,"morn":277.65},"feels_like":{"day":285.23,"night":277.83,"eve":280.4,"morn":275.02},"pressure":1010,"humidity":41,"dew_point":273.68,"wind_speed":6.86,"wind_deg":236,"wind_gust":11.48,"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":59,"pop":0.1,"uvi":2.34},{"dt":1666026000,"sunrise":1666006648,"sunset":1666046157,"moonrise":0,"moonset":1666034280,"moon_phase":0.75,"temp":{"day":280.39,"min":275.08,"max":280.49,"night":275.08,"eve":277.24,"morn":276.13},"feels_like":{"day":276.15,"night":270.51,"eve":273.16,"morn":272.11},"pressure":1002,"humidity":52,"dew_point":271.02,"wind_speed":8.51,"wind_deg":251,"wind_gust":12.6,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"clouds":82,"pop":0.56,"rain":0.13,"uvi":1.74},{"dt":1666112400,"sunrise":1666093121,"sunset":1666132461,"moonrise":1666065780,"moonset":1666122780,"moon_phase":0.78,"temp":{"day":277.8,"min":274.48,"max":278.63,"night":276.79,"eve":276.61,"morn":276.17},"feels_like":{"day":273.37,"night":272.51,"eve":271.84,"morn":272.43},"pressure":1004,"humidity":84,"dew_point":275.11,"wind_speed":7.4,"wind_deg":253,"wind_gust":12.2,"weather":[{"id":616,"main":"Snow","description":"rain and snow","icon":"13d"}],"clouds":100,"pop":0.9,"rain":2.95,"snow":0.12,"uvi":0.94},{"dt":1666198800,"sunrise":1666179594,"sunset":1666218765,"moonrise":1666155960,"moonset":1666210920,"moon_phase":0.81,"temp":{"day":278.11,"min":273.95,"max":278.91,"night":277.21,"eve":277.28,"morn":273.95},"feels_like":{"day":273.74,"night":272.71,"eve":272.75,"morn":270.43},"pressure":1011,"humidity":92,"dew_point":276.65,"wind_speed":6.99,"wind_deg":278,"wind_gust":12.51,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"clouds":100,"pop":0.9,"rain":4.68,"uvi":0.94},{"dt":1666285200,"sunrise":1666266068,"sunset":1666305070,"moonrise":1666246260,"moonset":1666298820,"moon_phase":0.84,"temp":{"day":281.42,"min":274.82,"max":282.59,"night":281.18,"eve":280.91,"morn":275.24},"feels_like":{"day":277.33,"night":277.72,"eve":277.34,"morn":270.19},"pressure":1010,"humidity":44,"dew_point":269.68,"wind_speed":8.93,"wind_deg":245,"wind_gust":15.48,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":100,"pop":0.06,"uvi":1},{"dt":1666371600,"sunrise":1666352542,"sunset":1666391377,"moonrise":1666336680,"moonset":1666386600,"moon_phase":0.87,"temp":{"day":288.4,"min":280.75,"max":288.4,"night":286.24,"eve":286.34,"morn":281.18},"feels_like":{"day":287.02,"night":285.15,"eve":285.28,"morn":277.76},"pressure":1009,"humidity":40,"dew_point":274.79,"wind_speed":9.38,"wind_deg":223,"wind_gust":18.25,"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"clouds":100,"pop":0,"uvi":1},{"dt":1666458000,"sunrise":1666439017,"sunset":1666477684,"moonrise":1666427040,"moonset":1666474200,"moon_phase":0.9,"temp":{"day":292.04,"min":284.28,"max":292.04,"night":288.5,"eve":289.12,"morn":284.28},"feels_like":{"day":291.24,"night":287.79,"eve":288.44,"morn":283.3},"pressure":1010,"humidity":48,"dew_point":280.68,"wind_speed":9.55,"wind_deg":218,"wind_gust":17.58,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":30,"pop":0,"uvi":1}]}
  // `);
  // return new Promise(resolve => resolve(success(json)));
}

import { useEffect, useState } from 'react'
import axios from 'axios'
import { format, } from 'date-fns'
import { es } from 'date-fns/locale'

function Table({ location }) {
  const [weatherData, setWeatherData] = useState(null)
  const formattedDate = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  useEffect(() => {
    const fetchData = async () => {
      const url = `${import.meta.env.VITE_WEATHERMAP_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&lang=es&appid=${import.meta.env.VITE_WEATHERMAP_API_KEY}`

      try {
        const response = await axios.get(url)
        setWeatherData(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [location])

  if (!weatherData) {
    return
  }

  const { weather, main, wind, clouds } = weatherData
  const { temp, feels_like, temp_min, temp_max, humidity } = main
  const { main: weatherMain, description, icon } = weather[0]

  const weatherDetails = [
    { label: 'Clima', value: weatherMain },
    { label: 'Descripción', value: description },
    { label: 'Temperatura', value: `${temp} °C` },
    { label: 'Sensación Térmica', value: `${feels_like} °C` },
    { label: 'Temperatura Mínima', value: `${temp_min} °C` },
    { label: 'Temperatura Máxima', value: `${temp_max} °C` },
    { label: 'Humedad', value: `${humidity} %` },
    { label: 'Velocidad del viento', value: `${wind.speed} %` },
    { label: 'Dirección del viento', value: `${wind.deg} °` },
    { label: 'Nubosidad', value: `${clouds.all} %` }
  ]

  return (
    <section className="bg-opacity-10 bg-cyan-100 dark:bg-opacity-20 dark:bg-sky-700 p-10 m-4 rounded-lg">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-slate-950 dark:text-neutral-100 font-semibold text-lg">Datos meteorológicos actuales</h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center sm:gap-8 bg-gradient-to-b from-sky-500 to-sky-800 rounded-lg pb-8 sm:pb-0 py-2 relative z-10">
        <img className="w-30 inline-block" src={`http://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} />
        <p className="flex flex-col text-white font-light">
          <span className="text-5xl font-bold">{parseInt(temp)} °C</span>
          <span className="text-sm">{formattedDate}</span>
        </p>
      </div>

      <div className="transform -translate-y-3 pt-3 bg-neutral-100 dark:bg-slate-950">
        <table className="min-w-full bg-neutral-100 dark:bg-slate-950 rounded-b-lg">
          <tbody>
            {weatherDetails.map((detail, index) => (
              <tr key={index} className="text-slate-950 dark:text-neutral-100">
                <td className="py-2 px-4 border-b border-neutral-200 dark:border-slate-800 font-thin">{detail.label}</td>
                <td className="py-2 px-4 border-b border-neutral-200 dark:border-slate-800 font-medium">{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  )
}

export default Table

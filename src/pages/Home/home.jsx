import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import LineGraph from '../../components/LineGraph'
import AreaGraph from '../../components/AreaGraph'
import Table from '../../components/Table'
import axios from 'axios'
import './home.scss'

function Home() {
  const [location, setLocation] = useState({ latitude: 4.6953937, longitude: -74.1240992 })
  const [showLoader, setShowLoader] = useState(true)
  const [lineGraphicStatus, setLineGraphicStatus] = useState(true)
  const [areaGraphicStatus, setAreaGraphicStatus] = useState(true)
  const [error, setError] = useState(null)
  const [locationName, setLocationName] = useState('')

  useEffect(() => {
    const handleGetLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => {
            setError(error.message)
          }
        )
      }
    }

    handleGetLocation()
  }, [])

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
          params: {
            format: 'json',
            lat: location.latitude,
            lon: location.longitude,
          },
        })

        setLocationName(` ${response.data.address.city}, ${response.data.address.country}`)
      } catch (error) {
        console.error('Error fetching location name:', error)
      }
    }

    fetchLocationName()
  }, [location])

  useEffect(() => {
    setShowLoader(lineGraphicStatus || areaGraphicStatus)
  }, [lineGraphicStatus, areaGraphicStatus])

  const handleLoadedDataLineGraph = (value) => {
    setLineGraphicStatus(value)
  }

  const handleLoadedDataAreaGraph = (value) => {
    setAreaGraphicStatus(value)
  }

  return (
    <>
      <div className="bg-neutral-100 dark:bg-slate-950 h-full">
        <Navbar />

        <section className={`h-screen overflow-hidden bg-neutral-100 dark:bg-slate-950 ${showLoader ? "block" : "hidden"}`}>
          <div className="container-loader">
            <div className="container-loader__loader"/>
          </div>
        </section>

        <section className={`container ${showLoader ? "hidden" : "flex"}`}>
          <div className="text-slate-950 dark:text-neutral-100 font-extralight">
            <p>
              Encuentra datos precisos y actualizados sobre la contaminación del aire, la temperatura y la probabilidad de precipitación en tu área en
              <span>{locationName}</span>. Nuestra plataforma ofrece:
            </p>

            <ul>
              <li><span>Gráfica de Contaminación del Aire:</span> Monitorea los niveles de contaminantes en el aire en los últimos 3 meses.</li>
              <li><span>Gráfica de Temperatura y Probabilidad de Precipitación:</span> Consulta las tendencias de temperatura y las probabilidades de lluvia en los próximos 5 días.</li>
              <li><span>Tabla con Datos Climáticos Actuales:</span> Obtén una visión detallada de las condiciones meteorológicas actuales, incluyendo la temperatura, la humedad, la velocidad del viento y otros datos relevantes.</li>
            </ul>
          </div>

          <LineGraph location={location} onLoadedDataLineChart={handleLoadedDataLineGraph} />
          <AreaGraph location={location} onLoadedDataAreaChart={handleLoadedDataAreaGraph} />
          <Table location={location} />
        </section>
      </div>
    </>
  )
}

export default Home

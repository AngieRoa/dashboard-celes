import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Chart from 'chart.js/auto'

function AreaGraph({ location, onLoadedDataAreaChart }) {
  const chartRef = useRef(null)
  const [mappedInformationForGraphing, setMappedInformationForGraphing] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const url = `${import.meta.env.VITE_WEATHERMAP_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${import.meta.env.VITE_WEATHERMAP_API_KEY}`

      try {
        const response = await axios.get(url)
        setMappedInformationForGraphing(mapData(response.data.list))
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [location])

  useEffect(() => {
    if (!Object.keys(mappedInformationForGraphing).length) return

    const ctx = chartRef.current.getContext('2d')

    const data = {
      labels: mappedInformationForGraphing.dt_txt,
      datasets: [
        {
          label: 'Temperatura',
          data: mappedInformationForGraphing.temp,
          borderColor: 'rgb(130, 192, 75)',
          tension: 0.4,
          fill: false
        },
        {
        label: 'Probabilidad de precipitación',
        data: mappedInformationForGraphing.pop,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        tension: 0.4,
        fill: 'start'
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        interaction: {
          mode: 'index'
        },
      }
    }

    const chart = new Chart(ctx, config)
    onLoadedDataAreaChart(false)
    return () => chart.destroy()
  }, [mappedInformationForGraphing])

  const mapData = (data) => {
    if (!data) return {}

    return data.reduce((item, { dt_txt, pop, main }) => {
      const formattedDate = format(new Date(dt_txt), "MMMM d - HH:mm", { locale: es })

      item['dt_txt'] = [...(item['dt_txt'] || []), formattedDate]
      item['pop'] = [...(item['pop'] || []), pop]
      item['temp'] = [...(item['temp'] || []), main.temp]

      return item
    }, {})
  }

  return (
    <>
      <section className="bg-opacity-10 bg-cyan-100 dark:bg-opacity-20 dark:bg-sky-700 p-10 m-4 rounded-lg">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-slate-950 dark:text-neutral-100 font-semibold text-lg">Gráfico de temperatura y probabilidad de precipitación</h2>
        </div>

        <div className="overflow-auto">
          <div className="min-w-[800px] min-h-[400]">
            <canvas ref={chartRef} />
          </div>
        </div>
      </section>
    </>
  )
}

export default AreaGraph

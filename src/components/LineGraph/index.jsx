import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Chart from 'chart.js/auto'

function LineGraph({ location, onLoadedDataLineChart }) {
  const chartRef = useRef(null)
  const [dataResponse, setDataResponse] = useState([])
  const [mappedInformationForGraphing, setMappedInformationForGraphing] = useState({})
  const todayUnix = Math.floor(new Date().getTime() / 1000)
  const threeMonthsAgoUnix = todayUnix - 7776000

  const generateDateIntervals = (threeMonthsAgo, today) => {
    const oneMonthInSeconds = 2592000
    const intervals = []

    for (let i = 0; i < 3; i++) {
        const startUnix = threeMonthsAgo + (i * oneMonthInSeconds)
        const endUnix = i === 2 ? today : startUnix + oneMonthInSeconds - 1

        const startDate = new Date(startUnix * 1000)
        const endDate = new Date(endUnix * 1000)

        const startLabel = startDate.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })
        const endLabel = endDate.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })

        intervals.push({
            label: `${startLabel} - ${endLabel}`,
            start: startUnix,
            end: endUnix
        })
    }

    return intervals
  }

  const intervals = generateDateIntervals(todayUnix - 7776000, todayUnix)

  useEffect(() => {
    const fetchData = async () => {
      const url = `${import.meta.env.VITE_WEATHERMAP_URL}/air_pollution/history?lat=${location.latitude}&lon=${location.longitude}&start=${threeMonthsAgoUnix}&end=${todayUnix}&appid=${import.meta.env.VITE_WEATHERMAP_API_KEY}`

      try {
        const response = await axios.get(url)
        const dataMap = {}

        response.data.list.forEach(item => {
          const date = new Date(item.dt * 1000)
          const day = date.toDateString()

          if (!dataMap[day]) {
            dataMap[day] = item
          }
        })

        setDataResponse(Object.values(dataMap))
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [location])

  useEffect(() => {
    if (dataResponse.length > 0) {
      changeDateRange(intervals[2].start, intervals[2].end)
    }
  }, [dataResponse])

  useEffect(() => {
    if (!Object.keys(mappedInformationForGraphing).length) return

    const ctx = chartRef.current.getContext('2d')

    const datasetConfigurations = [
      { label: 'Índice de calidad del aire', key: 'aqi', color: 'rgb(75, 192, 192)', yAxisID: 'y' },
      { label: 'Monóxido de carbono (CO)', key: 'co', color: 'rgb(75, 130, 192)', yAxisID: 'y1' },
      { label: 'Amoniaco (NH₃)', key: 'nh3', color: 'rgb(192, 75, 130)', yAxisID: 'y' },
      { label: 'Monóxido de nitrógeno (NO)', key: 'no', color: 'rgb(192, 130, 75)', yAxisID: 'y' },
      { label: 'Dióxido de nitrógeno (NO₂)', key: 'no2', color: 'rgb(130, 192, 75)', yAxisID: 'y' },
      { label: 'Ozono (O₃)', key: 'o3', color: 'rgb(130, 75, 192)', yAxisID: 'y' },
      { label: 'Partículas finas (PM₂,₅)', key: 'pm2_5', color: 'rgb(192, 192, 75)', yAxisID: 'y' },
      { label: 'Partículas gruesas (PM₁₀)', key: 'pm10', color: 'rgb(75, 192, 130)', yAxisID: 'y' },
      { label: 'Dióxido de azufre (SO₂)', key: 'so2', color: 'rgb(192, 75, 75)', yAxisID: 'y' }
    ]

    const datasets = datasetConfigurations.map(config => ({
      label: config.label,
      data: mappedInformationForGraphing[config.key],
      borderColor: config.color,
      fill: false,
      yAxisID: config.yAxisID
    }))

    const data = {
      labels: mappedInformationForGraphing.dt,
      datasets: datasets
    }

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        elements: {
          line: {
            tension: 0.4
          }
        },
        interaction: {
          mode: 'index'
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left'
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        }
      }
    }

    const chart = new Chart(ctx, config)
    onLoadedDataLineChart(false)
    return () => chart.destroy()
  }, [mappedInformationForGraphing])

  const mapData = (data) => {
    if (!data) return {}

    return data.reduce((item, { components = {}, main, dt }) => {
      Object.entries(components).forEach(([key, value]) => {
        item[key] = [...(item[key] || []), value]
      })

      const monthName = new Date(dt * 1000).toLocaleDateString('es-ES', { month: 'long' })
      const formattedDate = `${monthName} ${new Date(dt * 1000).getDate()}`
      item['aqi'] = [...(item['aqi'] || []), main.aqi]
      item['dt'] = [...(item['dt'] || []), formattedDate]

      return item
    }, {})
  }

  const changeDateRange = (start, end) => {
    const itemDates = dataResponse.map(item => new Date(item.dt * 1000))

    const filteredData = dataResponse.filter((_, index) => {
      const itemDate = itemDates[index]
      return itemDate >= new Date(start * 1000) && itemDate <= new Date(end * 1000)
    })

    setMappedInformationForGraphing(mapData(filteredData))
  }

  return (
    <>
      <section className="bg-opacity-10 bg-cyan-100 dark:bg-opacity-20 dark:bg-sky-700 p-10 m-4 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-slate-950 dark:text-neutral-100 font-semibold text-lg">Gráfico de la contaminación del aire</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-end w-full sm:w-auto">
          {
            intervals.map((interval, index) => (
                <button
                  id={`interval-button-${index}`}
                  className="text-sm text-white px-3 py-1 rounded bg-blue-400 hover:bg-blue-500 dark:bg-teal-600 dark:hover:bg-teal-800 w-full sm:w-auto"
                  key={index}
                  onClick={() => changeDateRange(interval.start, interval.end) }
                  >
                    {interval.label}
                </button>
            ))
          }
          </div>
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

export default LineGraph

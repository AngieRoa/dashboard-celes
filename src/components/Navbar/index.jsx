import { useEffect, useState } from "react"
import Moon from "../../assets/Icons/moon.png"
import Sun from "../../assets/Icons/sun.png"
import './index.scss'

function Navbar() {
  const [theme, setTheme] = useState(
    () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
  const [icon, setIcon] = useState(
    () => theme === 'dark' ? Moon : Sun
  )

  useEffect(() => {
    document.querySelector('html').classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleChangeTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
    setIcon(theme === 'light' ? Moon : Sun)
  }

  return (
    <>
      <div className="navbar">
        <h1 id="title-navbar" data-testid="title-navbar">Datos Meteorológicos</h1>

        <button
          id="change-theme-button"
          data-testid="change-theme-button"
          className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 dark:bg-teal-600 dark:hover:bg-teal-800 "
          onClick={ handleChangeTheme }>
          <img className="w-6 inline-block" src={icon} alt='icon' data-testid="icon-theme"/>
        </button>
      </div>
    </>
  )
}

export default Navbar

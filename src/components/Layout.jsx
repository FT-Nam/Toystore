import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './layout/Header'
import Footer from './layout/Footer'
import '../styles/layout.scss'

function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout 
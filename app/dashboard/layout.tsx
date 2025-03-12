import Header from '@/components/Header'
import React from 'react'

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="min-h-screen bg-slate-50">
        <Header />

        <main>
            {children}
        </main>
    </div>
  )
}

export default DashboardLayout
'use client'

// Next Imports
import dynamic from 'next/dynamic'

// Chargement cote client uniquement (ApexCharts n'est pas compatible SSR)
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default ApexChart

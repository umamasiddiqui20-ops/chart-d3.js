'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  BarChart3,
  Table,
  CalendarRange,
  Play,
  Pause,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  MoreVertical,
} from 'lucide-react'

import { toast } from 'sonner'
import { metricOptions, colorPresets, allChartsData } from '@/lib/chart-data'
// Mini Chart Component for "Many Charts" view
function MiniChart({ chart, isSelected, barColor, onClick }) {
  const svgRef = useRef(null)
  const [dimensions] = useState({ width: 340, height: 220 })

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 45, right: 55, bottom: 30, left: 15 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleBand()
      .domain(chart.data.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.35)

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(...chart.data.map(d => d.value)) * 1.35])
      .range([height, 0])

    // Find future start
    const futureStartIndex = chart.data.findIndex(d => d.isFuture)
    if (futureStartIndex > 0) {
      const futureStartX = xScale(chart.data[futureStartIndex].year.toString()) || 0

      // Past label
      g.append('text')
        .attr('x', futureStartX - xScale.bandwidth() * 0.5)
        .attr('y', -20)
        .attr('text-anchor', 'end')
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .text('Past')

      // Future box
      const futureBoxX = futureStartX - xScale.bandwidth() * 0.2
      const futureBoxWidth = width - futureBoxX + 8

      g.append('rect')
        .attr('x', futureBoxX)
        .attr('y', -30)
        .attr('width', futureBoxWidth)
        .attr('height', height + 30)
        .attr('fill', 'none')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 1.5)
        .attr('rx', 3)

      // Future label
      g.append('text')
        .attr('x', futureBoxX + 8)
        .attr('y', -15)
        .attr('fill', '#22c55e')
        .attr('font-size', '10px')
        .text('Future')
    }

    // Bars
    const pastColor = d3.color(barColor)?.brighter(0.7)?.toString() || barColor
    g.selectAll('.bar')
      .data(chart.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('rx', 3)
      .attr('fill', d => (d.isFuture ? barColor : pastColor))

    // Value labels for last point
    const lastDataPoint = chart.data[chart.data.length - 1]
    g.append('text')
      .attr('x', (xScale(lastDataPoint.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', yScale(lastDataPoint.value) - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(`$${lastDataPoint.value}${chart.unit}`)

    g.append('text')
      .attr('x', (xScale(lastDataPoint.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', yScale(lastDataPoint.value) - 7)
      .attr('text-anchor', 'middle')
      .attr('fill', lastDataPoint.change >= 0 ? '#22c55e' : '#ef4444')
      .attr('font-size', '10px')
      .text(`${lastDataPoint.change >= 0 ? '+' : ''}${lastDataPoint.change}%`)

    // X Axis
    const xAxis = g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale))
    xAxis.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '9px')
    xAxis.selectAll('line').remove()
    xAxis.select('.domain').remove()

    // Y Axis indicator badge
    g.append('rect')
      .attr('x', width + 8)
      .attr('y', yScale(lastDataPoint.value) - 10)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', barColor)
      .attr('rx', 3)

    g.append('text')
      .attr('x', width + 28)
      .attr('y', yScale(lastDataPoint.value) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text(`${lastDataPoint.value}${chart.unit}`)
  }, [chart, dimensions, barColor])

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-green-500 shadow-lg ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Microsoft Logo */}
          <div className="w-6 h-6 grid grid-cols-2 gap-px">
            <div className="bg-[#f25022] rounded-sm" />
            <div className="bg-[#7fba00] rounded-sm" />
            <div className="bg-[#00a4ef] rounded-sm" />
            <div className="bg-[#ffb900] rounded-sm" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{chart.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded bg-green-500 text-white" onClick={(e) => { e.stopPropagation(); toast('Already in bar chart view'); }}>
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('Table toggle coming soon'); }}>
            <Table className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('Download feature coming soon'); }}>
            <CloudDownload className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('More options coming soon'); }}>
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p className="px-4 text-xs text-gray-500 mb-1">{chart.subtitle}</p>

      {/* Chart */}
      <svg ref={svgRef} />
    </div>
  )
}

// Table View Component
function TableView({ data, selectedMetric }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{selectedMetric.label}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">% Change</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${row.value}B</td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {row.change >= 0 ? '+' : ''}{row.change}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  row.isFuture ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {row.isFuture ? 'Projected' : 'Historical'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function EBITDAChart() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 500 })
  const [showLabels, setShowLabels] = useState(true)
  const [showPercentChanges, setShowPercentChanges] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [barColor, setBarColor] = useState('#22c55e')
  const [isPlaying, setIsPlaying] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(null)
  const [tooltipData, setTooltipData] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState(metricOptions[0])
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')
  const [activeView, setActiveView] = useState('bars')
  const playIntervalRef = useRef(null)

  // Color picker state
  const [customHex, setCustomHex] = useState('22c55e')
  const [customR, setCustomR] = useState(34)
  const [customG, setCustomG] = useState(197)
  const [customB, setCustomB] = useState(94)
  const [customA, setCustomA] = useState(100)

  // Dynamic data
  const chartData = allChartsData.find(c => c.id === selectedMetric.id)?.data || allChartsData[0].data

  // Calculate statistics
  const currentValue = chartData.find(d => d.year === 2024)?.value || chartData[chartData.length - 1].value
  const lastYearGrowth = chartData.find(d => d.year === 2024)?.change || chartData[chartData.length - 1].change
  const last3YearsAvgGrowth = (() => {
    const past = chartData.filter(d => !d.isFuture).slice(-3)
    return past.length ? past.reduce((acc, d) => acc + d.change, 0) / past.length : 0
  })()
  const next3YearsAvgGrowth = (() => {
    const future = chartData.filter(d => d.isFuture).slice(0, 3)
    return future.length ? future.reduce((acc, d) => acc + d.change, 0) / future.length : 0
  })()

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: Math.max(width - 80, 800), height: 500 })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Play animation
  useEffect(() => {
    if (isPlaying) {
      let currentIndex = highlightedIndex ?? -1
      playIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % chartData.length
        setHighlightedIndex(currentIndex)
      }, 800)
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, highlightedIndex])

  // D3 Chart rendering
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    
    const margin = { top: 60, right: 80, bottom: 60, left: 50 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    svg.attr('width', dimensions.width).attr('height', dimensions.height)

    let g = svg.select('g.main-group')
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-group')
      g.append('g').attr('class', 'grid-group')
      g.append('g').attr('class', 'future-group')
      g.append('g').attr('class', 'axis-group')
      g.append('g').attr('class', 'bars-group')
      g.append('g').attr('class', 'labels-group')
    }
    g.attr('transform', `translate(${margin.left},${margin.top})`)

    const gridGroup = g.select('.grid-group')
    const futureGroup = g.select('.future-group')
    const axisGroup = g.select('.axis-group')
    const barsGroup = g.select('.bars-group')
    const labelsGroup = g.select('.labels-group')

    gridGroup.selectAll('*').remove()
    futureGroup.selectAll('*').remove()
    axisGroup.selectAll('*').remove()

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(chartData.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.35)

    const maxValue = Math.max(...chartData.map(d => d.value))
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.15])
      .range([height, 0])

    // Find the dividing line between past and future
    const futureStartIndex = chartData.findIndex(d => d.isFuture)
    const futureStartX = futureStartIndex >= 0 ? (xScale(chartData[futureStartIndex].year.toString()) || 0) : width

    // Grid lines
    if (showGrid) {
      const yAxisGrid = d3.axisRight(yScale)
        .tickSize(width)
        .tickFormat(() => '')
        .ticks(6)

      gridGroup.call(yAxisGrid)
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '3,3')

      gridGroup.select('.domain').remove()
      
      // Horizontal baseline dotted line from the last "Past" value
      if (futureStartIndex > 0 && !isPlaying) {
        const baselineValue = chartData[futureStartIndex - 1].value
        const baselineY = yScale(baselineValue)
        gridGroup.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', baselineY)
          .attr('y2', baselineY)
          .attr('stroke', '#9ca3af')
          .attr('stroke-dasharray', '4,4')
      }
    }

    // Future box & Shading
    if (futureStartIndex >= 0) {
      const futureBoxX = futureStartX - xScale.bandwidth() * 0.15
      const futureBoxWidth = width - futureBoxX + 10
      const peakValue = Math.max(...chartData.filter(d => d.isFuture).map(d => d.value))
      const peakY = yScale(peakValue)

      // Light filled background for future
      futureGroup.append('rect')
        .attr('x', futureBoxX)
        .attr('y', 0)
        .attr('width', futureBoxWidth)
        .attr('height', height)
        .attr('fill', barColor)
        .attr('fill-opacity', 0.1)

      // Solid top border for future
      futureGroup.append('line')
        .attr('x1', futureBoxX)
        .attr('x2', futureBoxX + futureBoxWidth)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', barColor)
        .attr('stroke-width', 2)

      // Past label
      futureGroup.append('text')
        .attr('x', futureBoxX - 10)
        .attr('y', 15)
        .attr('text-anchor', 'end')
        .attr('fill', '#9ca3af')
        .attr('font-size', '11px')
        .text('Past')

      // Future label
      futureGroup.append('text')
        .attr('x', futureBoxX + 10)
        .attr('y', 15)
        .attr('fill', '#9ca3af')
        .attr('font-size', '11px')
        .text('Future')
        
      if (!isPlaying) {
        // Dotted line for projected peak
        futureGroup.append('line')
          .attr('x1', futureBoxX)
          .attr('x2', width + 20)
          .attr('y1', peakY)
          .attr('y2', peakY)
          .attr('stroke', barColor)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4')
          
        // Label for peak
        futureGroup.append('rect')
          .attr('x', width + 5)
          .attr('y', peakY - 10)
          .attr('width', 45)
          .attr('height', 20)
          .attr('fill', barColor)
          .attr('rx', 3)
          
        futureGroup.append('text')
          .attr('x', width + 27)
          .attr('y', peakY + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(`$${peakValue}B`)
      }
    }

    // Calculate colors
    const futureColor = barColor
    const pastColor = d3.color(barColor)?.brighter(0.5)?.toString() || barColor
    const highlightColor = d3.color(barColor)?.darker(0.2)?.toString() || barColor

    // Bars with conditional smooth transitions (.join)
    const barsData = barsGroup.selectAll('.bar')
      .data(chartData, d => d.year)

    const barsEnter = barsData.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 4)
      .style('cursor', 'pointer')

    const barsUpdate = barsEnter.merge(barsData)
      
    // Apply position and heights
    const t = barsUpdate.transition().duration(600)
    
    t.attr('x', d => xScale(d.year.toString()) || 0)
     .attr('width', xScale.bandwidth())
     .attr('y', d => yScale(d.value))
     .attr('height', d => height - yScale(d.value))

    // Apply colors (instant if playing, otherwise transition)
    if (isPlaying) {
      barsUpdate.attr('fill', (d, i) => {
        if (highlightedIndex === i) return highlightColor
        return d.isFuture ? futureColor : pastColor
      })
    } else {
      t.attr('fill', (d, i) => {
        return d.isFuture ? futureColor : pastColor
      })
    }

    barsData.exit()
      .transition()
      .duration(400)
      .attr('y', height)
      .attr('height', 0)
      .remove()

    // X Axis
    const xAxis = axisGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))

    xAxis.selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .attr('font-weight', '500')

    xAxis.selectAll('line').remove()
    xAxis.select('.domain').remove()

    // Y Axis (right side)
    const yAxisTicks = yScale.ticks(6)
    yAxisTicks.forEach(tick => {
      axisGroup.append('text')
        .attr('x', width + 15)
        .attr('y', yScale(tick))
        .attr('dy', '0.35em')
        .attr('fill', '#6b7280')
        .attr('font-size', '11px')
        .text(`$${tick}B`)
    })

    // Labels with smooth transitions
    const valueLabels = labelsGroup.selectAll('.value-label')
      .data(showLabels ? chartData : [], d => d.year)
      
    valueLabels.enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .attr('fill', '#111827')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => `$${d.value}B`)
      .merge(valueLabels)
      .transition()
      .duration(600)
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 22)
      .text(d => `$${d.value}B`)
      
    valueLabels.exit().remove()

    const changeLabels = labelsGroup.selectAll('.change-label')
      .data(showPercentChanges ? chartData : [], d => d.year)
      
    changeLabels.enter()
      .append('text')
      .attr('class', 'change-label')
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .merge(changeLabels)
      .transition()
      .duration(600)
      .attr('x', d => (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 6)
      .attr('fill', d => d.change >= 0 ? barColor : '#ef4444')
      .text(d => `${d.change >= 0 ? '+' : ''}${d.change}%`)
      
    changeLabels.exit().remove()

    // Highlight indicator (current value line when playing)
    if (highlightedIndex !== null && isPlaying) {
      const highlightedData = chartData[highlightedIndex]
      const barX = xScale(highlightedData.year.toString()) || 0
      const barCenter = barX + xScale.bandwidth() / 2

      labelsGroup.append('line')
        .attr('x1', barCenter)
        .attr('x2', barCenter)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#9ca3af')
        .attr('stroke-dasharray', '4,4')

      labelsGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width + 50)
        .attr('y1', yScale(highlightedData.value))
        .attr('y2', yScale(highlightedData.value))
        .attr('stroke', '#9ca3af')
        .attr('stroke-dasharray', '4,4')
    }

    // Bar hover interactions
    barsUpdate.on('mouseenter', function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('fill', highlightColor)

      if (showTooltip) {
        const barX = (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2 + margin.left
        const barY = yScale(d.value) + margin.top - 10
        setTooltipData({ x: barX, y: barY, data: d })
      }
    })

    barsUpdate.on('mouseleave', function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('fill', d.isFuture ? futureColor : pastColor)

      setTooltipData(null)
    })

  }, [dimensions, chartData, showLabels, showPercentChanges, showGrid, barColor, highlightedIndex, isPlaying, showTooltip])

  const handleColorChange = useCallback((color) => {
    setBarColor(color)
    // Update hex/rgb values
    const rgb = d3.color(color)
    if (rgb) {
      setCustomHex(color.replace('#', ''))
      setCustomR(rgb.r)
      setCustomG(rgb.g)
      setCustomB(rgb.b)
    }
  }, [])

  const handleHexChange = useCallback((hex) => {
    setCustomHex(hex)
    if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
      const color = `#${hex}`
      setBarColor(color)
      const rgb = d3.color(color)
      if (rgb) {
        setCustomR(rgb.r)
        setCustomG(rgb.g)
        setCustomB(rgb.b)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header Tabs */}
      <div className="px-6 pt-4 flex items-end gap-6 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex items-center gap-2 pb-2 transition-colors relative ${
            activeTab === 'charts' ? 'text-gray-900 border-b-2 border-pink-500 font-semibold mb-[-1px]' : 'text-gray-500 hover:text-gray-700 font-medium'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm">Many Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 pb-2 transition-colors relative ${
            activeTab === 'analysis' ? 'text-gray-900 border-b-2 border-pink-500 font-semibold mb-[-1px]' : 'text-gray-500 hover:text-gray-700 font-medium'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 12l4-4 4 4 5-5" />
          </svg>
          <span className="text-sm">Analysis</span>
        </button>
      </div>

      {/* Many Charts View */}
      {activeTab === 'charts' && (
        <div className="bg-gray-50 min-h-[calc(100vh-60px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allChartsData.map(chart => (
              <MiniChart
                key={chart.id}
                chart={chart}
                isSelected={selectedMetric.id === chart.id}
                barColor={barColor}
                onClick={() => {
                  const metric = metricOptions.find(m => m.id === chart.id)
                  if (metric) {
                    setSelectedMetric(metric)
                    setActiveTab('analysis')
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Analysis View - Main Content */}
      {activeTab === 'analysis' && (
      <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Microsoft Logo */}
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5 mt-1">
                <div className="bg-[#f25022] rounded-sm" />
                <div className="bg-[#7fba00] rounded-sm" />
                <div className="bg-[#00a4ef] rounded-sm" />
                <div className="bg-[#ffb900] rounded-sm" />
              </div>
              
              {/* Metric Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMetricDropdownOpen(!isMetricDropdownOpen)}
                  className="flex items-center gap-2 text-3xl font-bold text-gray-900 hover:text-gray-700 leading-tight tracking-tight"
                >
                  {selectedMetric.label}
                  <ChevronDown className="w-6 h-6 text-gray-400" strokeWidth={2.5} />
                </button>
                
                {isMetricDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {metricOptions.map((metric) => (
                      <button
                        key={metric.id}
                        onClick={() => {
                          setSelectedMetric(metric)
                          setIsMetricDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedMetric.id === metric.id ? 'bg-gray-50 bg-opacity-80' : ''
                        }`}
                      >
                        <span className="font-semibold text-gray-900">{metric.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-700 tracking-tight font-medium">
              {selectedMetric.label} Projected To Reach {selectedMetric.projected}
            </p>
          </div>

          {/* View Controls */}
          <div className="flex flex-wrap items-center gap-2 text-sm mt-4 md:mt-0">
            {/* View Mode Toggle Pills */}
            <button
              onClick={() => setActiveView('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                activeView === 'bars' ? 'bg-[#22c55e] border-[#22c55e] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
              Bars
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                activeView === 'table' ? 'bg-[#22c55e] border-[#22c55e] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Table className="w-4 h-4" strokeWidth={2.5} />
              Table
            </button>
            
            <div className="hidden md:block w-px h-6 bg-gray-200 mx-1"></div>

            <button onClick={() => toast('Date range selection coming soon')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all">
              <CalendarRange className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
              Range
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-gray-400" fill="currentColor" /> : <Play className="w-4 h-4 text-gray-400" fill="currentColor" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <div className="hidden md:block w-px h-6 bg-gray-200 mx-1"></div>

            {/* Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-xl" align="end">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show Labels</label>
                      <Switch
                        checked={showLabels}
                        onCheckedChange={setShowLabels}
                        className="data-[state=checked]:bg-[#22c55e]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show % Changes</label>
                      <Switch
                        checked={showPercentChanges}
                        onCheckedChange={setShowPercentChanges}
                        className="data-[state=checked]:bg-[#22c55e]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Show Tooltip</label>
                      <Switch
                        checked={showTooltip}
                        onCheckedChange={setShowTooltip}
                        className="data-[state=checked]:bg-[#22c55e]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Grid</label>
                      <Switch
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                        className="data-[state=checked]:bg-[#22c55e]"
                      />
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: barColor }}
                      />
                      <span className="text-sm font-medium text-gray-700">Color Variant</span>
                    </div>

                    {/* Color Presets */}
                    <div className="flex flex-wrap gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm ${
                            barColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Chart or Table View Container */}
        <div className="relative mt-8 min-h-[500px]">
          {/* Absolute Stats Box (Overlays chart on desktop, stacks on mobile) */}
          <div className="relative md:absolute top-0 left-0 z-10 w-full md:w-64 bg-white md:bg-white/95 md:backdrop-blur-sm border-2 border-green-50/50 shadow-sm md:shadow-md rounded-xl p-4 mb-8 md:mb-0 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-800 tracking-wide">{selectedMetric.label}</span>
                </div>
                <span className="font-bold text-gray-900">${currentValue}B</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span className="text-xs font-semibold text-gray-600">Last Year Growth</span>
                </div>
                <span className={`text-xs font-bold ${lastYearGrowth >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                  {lastYearGrowth >= 0 ? '+' : ''}{lastYearGrowth}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📈</span>
                  <span className="text-xs font-semibold text-gray-600">Last 3 Years Avg Growth</span>
                </div>
                <span className={`text-xs font-bold ${last3YearsAvgGrowth >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                  {last3YearsAvgGrowth >= 0 ? '+' : ''}{last3YearsAvgGrowth.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-semibold text-gray-600">Next 3 Years Avg</span>
                </div>
                <span className={`text-xs font-bold ${next3YearsAvgGrowth >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                  {next3YearsAvgGrowth >= 0 ? '+' : ''}{next3YearsAvgGrowth.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🚀</span>
                  <span className="text-xs font-semibold text-gray-600">Trend</span>
                </div>
                <span className="text-xs font-bold text-[#22c55e]">Strong Growth</span>
              </div>
            </div>
          </div>

          {activeView === 'bars' ? (
            <div ref={containerRef} className="w-full overflow-x-auto min-h-[500px]">
              <svg ref={svgRef} className="w-full min-w-[800px]" />
              
              {/* Custom Tooltip */}
              {tooltipData && showTooltip && (
                <div
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-4 pointer-events-none z-50 text-xs min-w-[180px]"
                  style={{
                    left: tooltipData.x,
                    top: Math.max(tooltipData.y - 100, 20),
                    transform: 'translate(-50%, -10px)',
                    transition: 'left 0.1s ease-out, top 0.1s ease-out'
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium tracking-wide">Date:</span>
                      <span className="font-bold text-gray-900">Dec 31, {tooltipData.data.year}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-gray-600 font-semibold">{selectedMetric.label}:</span>
                      <span className="font-bold text-gray-900 text-sm">${tooltipData.data.value}B</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className={`font-bold ${tooltipData.data.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>% YoY:</span>
                      <span className={`font-bold ${tooltipData.data.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tooltipData.data.change >= 0 ? '+' : ''}{tooltipData.data.change}%
                      </span>
                    </div>
                  </div>
                  {/* Tooltip Arrow pointing down */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 md:pl-72"><TableView data={chartData} selectedMetric={selectedMetric} /></div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mt-8 md:mt-12 mb-8">
          <button 
            onClick={() => {
              const currentIndex = metricOptions.findIndex(m => m.id === selectedMetric.id)
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : metricOptions.length - 1
              setSelectedMetric(metricOptions[prevIndex])
            }}
            className="flex items-center justify-between sm:justify-start gap-4 px-6 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all w-full sm:w-80 group"
          >
            <div className="bg-gray-100 p-2 rounded-full group-hover:-translate-x-1 transition-transform">
              <ChevronLeft className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
            </div>
            <div className="text-left flex-1">
              <div className="text-[10px] font-bold tracking-wider text-gray-400 mb-0.5">BACK</div>
              <div className="font-bold text-gray-900 text-lg leading-tight">
                {metricOptions[
                  metricOptions.findIndex(m => m.id === selectedMetric.id) > 0 
                    ? metricOptions.findIndex(m => m.id === selectedMetric.id) - 1 
                    : metricOptions.length - 1
                ].label}
              </div>
              <div className="text-xs text-gray-500 mt-1">View historical trends</div>
            </div>
          </button>
          
          <button 
            onClick={() => {
              const currentIndex = metricOptions.findIndex(m => m.id === selectedMetric.id)
              const nextIndex = (currentIndex + 1) % metricOptions.length
              setSelectedMetric(metricOptions[nextIndex])
            }}
            className="flex items-center justify-between sm:justify-start gap-4 px-6 py-5 bg-[#22c55e] border border-transparent shadow-md hover:shadow-lg hover:bg-[#16a34a] rounded-2xl transition-all w-full sm:w-80 group"
          >
            <div className="text-left flex-1">
              <div className="text-[10px] font-bold tracking-wider text-green-100 mb-0.5">NEXT</div>
              <div className="font-bold text-white text-lg leading-tight">
                {metricOptions[
                  (metricOptions.findIndex(m => m.id === selectedMetric.id) + 1) % metricOptions.length
                ].label}
              </div>
              <div className="text-xs text-green-100 mt-1">Analyze current performance</div>
            </div>
            <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
      )}

      {/* Click outside to close dropdown */}
      {isMetricDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMetricDropdownOpen(false)}
        />
      )}
    </div>
  )
}

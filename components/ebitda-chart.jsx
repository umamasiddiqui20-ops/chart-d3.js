'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import {
  BarChart3,
  Table,
  CalendarRange,
  Play,
  Pause,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  MoreVertical,
} from 'lucide-react'

import { toast } from 'sonner'
import { metricOptions, colorPresets, allChartsData } from '@/lib/chart-data'

// ── Color conversion helpers ──────────────────────────────────
function hsvToRgb(h, s, v) {
  s /= 100; v /= 100
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const cases = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]]
  const [r,g,b] = cases[i]
  return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) }
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (max !== min) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}
function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
}
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null
}

// ── Canvas Color Picker ───────────────────────────────────────
function ColorPicker({ color, onChange, presets }) {
  const svRef = useRef(null)
  const hueRef = useRef(null)
  const dragging = useRef(null)

  const initHsv = useCallback(() => {
    const rgb = hexToRgb(color)
    return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 120, s: 82, v: 76 }
  }, [color])

  const [hsv, setHsv] = useState(initHsv)
  const [alpha, setAlpha] = useState(100)
  const [hexInput, setHexInput] = useState(color.replace('#','').toUpperCase())

  // Sync external color changes into picker state
  useEffect(() => {
    const rgb = hexToRgb(color)
    if (!rgb) return
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    setHsv(newHsv)
    setHexInput(color.replace('#','').toUpperCase())
  }, [color])

  // Draw SV canvas
  useEffect(() => {
    const canvas = svRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 200, 150)
    const hGrad = ctx.createLinearGradient(0, 0, 200, 0)
    hGrad.addColorStop(0, '#fff')
    hGrad.addColorStop(1, `hsl(${hsv.h},100%,50%)`)
    ctx.fillStyle = hGrad
    ctx.fillRect(0, 0, 200, 150)
    const vGrad = ctx.createLinearGradient(0, 0, 0, 150)
    vGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vGrad.addColorStop(1, '#000')
    ctx.fillStyle = vGrad
    ctx.fillRect(0, 0, 200, 150)
  }, [hsv.h])

  // Draw hue canvas (once)
  useEffect(() => {
    const canvas = hueRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 200, 0)
    for (let i = 0; i <= 12; i++) grad.addColorStop(i/12, `hsl(${i*30},100%,50%)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 200, 14)
  }, [])

  const emitChange = useCallback((h, s, v) => {
    const rgb = hsvToRgb(h, s, v)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexInput(hex.replace('#','').toUpperCase())
    onChange(hex)
  }, [onChange])

  const handleSVDown = useCallback((e) => {
    dragging.current = 'sv'
    const update = (ev) => {
      const rect = svRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = Math.max(0, Math.min(200, ev.clientX - rect.left))
      const y = Math.max(0, Math.min(150, ev.clientY - rect.top))
      const newS = Math.round((x / 200) * 100)
      const newV = Math.round((1 - y / 150) * 100)
      setHsv(prev => { emitChange(prev.h, newS, newV); return { ...prev, s: newS, v: newV } })
    }
    update(e.nativeEvent ?? e)
    const onMove = ev => { if (dragging.current === 'sv') update(ev) }
    const onUp = () => { dragging.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [emitChange])

  const handleHueDown = useCallback((e) => {
    dragging.current = 'hue'
    const update = (ev) => {
      const rect = hueRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = Math.max(0, Math.min(200, ev.clientX - rect.left))
      const newH = Math.round((x / 200) * 360)
      setHsv(prev => { emitChange(newH, prev.s, prev.v); return { ...prev, h: newH } })
    }
    update(e.nativeEvent ?? e)
    const onMove = ev => { if (dragging.current === 'hue') update(ev) }
    const onUp = () => { dragging.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [emitChange])

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b)
  const svCursorX = Math.round((hsv.s / 100) * 200)
  const svCursorY = Math.round((1 - hsv.v / 100) * 150)
  const hueCursorX = Math.round((hsv.h / 360) * 200)

  return (
    <div>
      {/* Saturation–Value box */}
      <div className="cp-sv-wrapper" onMouseDown={handleSVDown}>
        <canvas ref={svRef} width={200} height={150} className="cp-sv-canvas" />
        <div className="cp-sv-cursor" style={{ left: svCursorX, top: svCursorY }} />
      </div>

      {/* Hue slider */}
      <div className="cp-hue-wrapper" onMouseDown={handleHueDown}>
        <canvas ref={hueRef} width={200} height={14} className="cp-hue-canvas" />
        <div className="cp-hue-cursor" style={{ left: hueCursorX }} />
      </div>

      {/* Preview + Inputs */}
      <div className="cp-inputs-row">
        <div className="cp-preview" style={{ backgroundColor: currentHex }} />
        <div className="cp-input-group">
          <input
            type="text" className="cp-hex-input" value={hexInput} maxLength={6}
            onChange={e => {
              setHexInput(e.target.value)
              if (/^[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                const hex = '#' + e.target.value
                const rgb2 = hexToRgb(hex)
                if (rgb2) { const h2 = rgbToHsv(rgb2.r, rgb2.g, rgb2.b); setHsv(h2); onChange(hex) }
              }
            }}
          />
          {[['r', rgb.r, 255], ['g', rgb.g, 255], ['b', rgb.b, 255]].map(([ch, val, max]) => (
            <input key={ch} type="number" className="cp-num-input" min={0} max={max} value={val}
              onChange={e => {
                const n = Number(e.target.value)
                const nr = ch==='r'?n:rgb.r, ng=ch==='g'?n:rgb.g, nb=ch==='b'?n:rgb.b
                const hex = rgbToHex(nr, ng, nb)
                const h2 = rgbToHsv(nr, ng, nb)
                setHsv(h2); setHexInput(hex.replace('#','').toUpperCase()); onChange(hex)
              }}
            />
          ))}
          <input type="number" className="cp-num-input" min={0} max={100} value={alpha}
            onChange={e => setAlpha(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="cp-input-labels">
        <span>Hex</span><span>R</span><span>G</span><span>B</span><span>A</span>
      </div>

      {/* Preset swatches */}
      <div className="chart-settings-swatches">
        {presets.map(p => (
          <button key={p} aria-label={`Select color ${p}`}
            className={`chart-color-swatch${color.toLowerCase()===p.toLowerCase()?' active':''}`}
            style={{ backgroundColor: p }}
            onClick={() => {
              const rgb2 = hexToRgb(p)
              if (rgb2) { setHsv(rgbToHsv(rgb2.r, rgb2.g, rgb2.b)); setHexInput(p.replace('#','').toUpperCase()); onChange(p) }
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Mini Chart Component for "Many Charts" view
function MiniChart({ chart, isSelected, barColor, onClick }) {
  const svgRef = useRef(null)
  const [dimensions] = useState({ width: 340, height: 240 })

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 58, right: 50, bottom: 26, left: 12 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Show last 9 data points for wider, readable bars
    const chartData = chart.data.slice(-9)

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleBand()
      .domain(chartData.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.32)

    const maxVal = Math.max(...chartData.map(d => d.value))
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.4])
      .range([height, 0])

    // Horizontal grid lines
    yScale.ticks(5).forEach(tick => {
      g.append('line')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', yScale(tick)).attr('y2', yScale(tick))
        .attr('stroke', '#f3f4f6')
        .attr('stroke-width', 1)
    })

    // Find future start
    const futureStartIndex = chartData.findIndex(d => d.isFuture)
    if (futureStartIndex > 0) {
      const futureStartX = xScale(chartData[futureStartIndex].year.toString()) || 0

      // Past label
      g.append('text')
        .attr('x', futureStartX - xScale.bandwidth() * 0.5)
        .attr('y', -22)
        .attr('text-anchor', 'end')
        .attr('fill', '#9ca3af')
        .attr('font-size', '9px')
        .text('Past')

      // Future shaded box
      const futureBoxX = futureStartX - xScale.bandwidth() * 0.2
      const futureBoxWidth = width - futureBoxX + 6

      g.append('rect')
        .attr('x', futureBoxX)
        .attr('y', -32)
        .attr('width', futureBoxWidth)
        .attr('height', height + 32)
        .attr('fill', 'rgba(34,197,94,0.05)')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 1.5)
        .attr('rx', 3)

      // Future label
      g.append('text')
        .attr('x', futureBoxX + 7)
        .attr('y', -18)
        .attr('fill', '#22c55e')
        .attr('font-size', '9px')
        .text('Future')
    } else if (futureStartIndex === 0) {
      // All data is future
      g.append('rect')
        .attr('x', -4).attr('y', -32)
        .attr('width', width + 10).attr('height', height + 32)
        .attr('fill', 'rgba(34,197,94,0.05)')
        .attr('stroke', '#22c55e').attr('stroke-width', 1.5).attr('rx', 3)
      g.append('text')
        .attr('x', 4).attr('y', -18)
        .attr('fill', '#22c55e').attr('font-size', '9px').text('Future')
    }

    // Bars
    const pastColor = d3.color(barColor)?.brighter(0.7)?.toString() || barColor
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('rx', 2)
      .attr('fill', d => (d.isFuture ? barColor : pastColor))

    // Value + change labels above every bar (horizontal)
    chartData.forEach(d => {
      const bx = (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2
      const by = yScale(d.value)

      g.append('text')
        .attr('x', bx)
        .attr('y', by - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1f2937')
        .attr('font-size', '7.5px')
        .attr('font-weight', '700')
        .text(chart.unit === '' ? `$${d.value}` : `$${d.value}${chart.unit}`)

      g.append('text')
        .attr('x', bx)
        .attr('y', by - 3)
        .attr('text-anchor', 'middle')
        .attr('fill', d.change >= 0 ? '#22c55e' : '#ef4444')
        .attr('font-size', '6.5px')
        .text(`${d.change >= 0 ? '+' : ''}${d.change}%`)
    })

    // X Axis
    const xAxis = g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale))
    xAxis.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '8.5px')
    xAxis.selectAll('line').remove()
    xAxis.select('.domain').remove()

    // Right Y-axis
    const yAxisRight = d3.axisRight(yScale)
      .ticks(5)
      .tickFormat(d => `${d}${chart.unit}`)
      .tickSize(0)
    const rightAxis = g.append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(yAxisRight)
    rightAxis.selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '8px')
      .attr('dx', '5px')
    rightAxis.select('.domain').remove()

    // Colored badge at last bar level
    const lastDataPoint = chartData[chartData.length - 1]
    g.append('rect')
      .attr('x', width + 6)
      .attr('y', yScale(lastDataPoint.value) - 10)
      .attr('width', 40)
      .attr('height', 20)
      .attr('fill', barColor)
      .attr('rx', 3)

    g.append('text')
      .attr('x', width + 26)
      .attr('y', yScale(lastDataPoint.value) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '8.5px')
      .attr('font-weight', '700')
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
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0.5">
        <div className="flex items-center gap-2">
          {/* Microsoft Logo */}
          <div className="w-5 h-5 grid grid-cols-2 gap-px">
            <div className="bg-[#f25022] rounded-sm" />
            <div className="bg-[#7fba00] rounded-sm" />
            <div className="bg-[#00a4ef] rounded-sm" />
            <div className="bg-[#ffb900] rounded-sm" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">{chart.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded bg-green-500 text-white" onClick={(e) => { e.stopPropagation(); toast('Already in bar chart view'); }}>
            <BarChart3 className="w-3 h-3" />
          </button>
          <button className="p-1 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('Table toggle coming soon'); }}>
            <Table className="w-3 h-3" />
          </button>
          <button className="p-1 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('Download feature coming soon'); }}>
            <CloudDownload className="w-3 h-3" />
          </button>
          <button className="p-1 rounded text-gray-400 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); toast('More options coming soon'); }}>
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p className="px-3 text-xs text-gray-500 mb-0.5">{chart.subtitle}</p>

      {/* Chart */}
      <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
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

const CHART_MARGIN = { top: 60, right: 80, bottom: 60, left: 50 }

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
  const [isVisible, setIsVisible] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false)
  const settingsRef = useRef(null)
  const playIntervalRef = useRef(null)
  const xScaleRef = useRef(null)
  const yScaleRef = useRef(null)
  const barColorRef = useRef(barColor)
  barColorRef.current = barColor

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

  // Trigger entrance animation after first paint
  useEffect(() => {
    if (dimensions.width > 0 && !isVisible) {
      const t = setTimeout(() => setIsVisible(true), 150)
      return () => clearTimeout(t)
    }
  }, [dimensions.width, isVisible])

  // Reset visibility on metric change so bars re-animate
  useEffect(() => {
    setIsVisible(false)
  }, [selectedMetric.id])

  // Close settings on outside click
  useEffect(() => {
    if (!isSettingsOpen) return
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false)
        setIsColorPickerVisible(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isSettingsOpen])

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
    const barColor = barColorRef.current

    const margin = CHART_MARGIN
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

    xScaleRef.current = xScale
    yScaleRef.current = yScale

    // Find the dividing line between past and future
    const futureStartIndex = chartData.findIndex(d => d.isFuture)
    const futureStartX = futureStartIndex >= 0 ? (xScale(chartData[futureStartIndex].year.toString()) || 0) : width

    // Square-box grid: horizontal lines at Y ticks + vertical lines through bar centers
    if (showGrid) {
      // Horizontal lines at each Y-axis tick
      yScale.ticks(6).forEach(tick => {
        const ty = yScale(tick)
        gridGroup.append('line')
          .attr('x1', 0).attr('x2', width)
          .attr('y1', ty).attr('y2', ty)
          .attr('stroke', '#e5e7eb').attr('stroke-width', 1)
      })
      // Vertical lines through each bar center
      chartData.forEach(d => {
        const bx = (xScale(d.year.toString()) || 0) + xScale.bandwidth() / 2
        gridGroup.append('line')
          .attr('x1', bx).attr('x2', bx)
          .attr('y1', 0).attr('y2', height)
          .attr('stroke', '#e5e7eb').attr('stroke-width', 1)
      })
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

    // Value-based gradient: small bars = light, large bars = user's chosen color
    const sortedByValue = [...chartData].sort((a, b) => a.value - b.value)
    const rankMap = new Map(sortedByValue.map((d, i) => [d.year, i]))
    const lightColor = d3.interpolateRgb(barColor, '#ffffff')(0.65)
    const highlightColor = d3.color(barColor)?.darker(0.4)?.toString() || barColor
    const getBarColor = (d) => {
      const rank = rankMap.get(d.year) ?? 0
      const t = rank / Math.max(chartData.length - 1, 1)
      return d3.interpolateRgb(lightColor, barColor)(t)
    }

    // Data join — new bars enter at scaleY(0) for entrance animation
    const barsJoin = barsGroup.selectAll('.bar')
      .data(chartData, d => d.year)

    barsJoin.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .style('transform', 'scaleY(0)')
      .style('transform-origin', '50% 100%')
      .attr('fill', d => getBarColor(d))

    // Update existing bar positions (e.g. on resize)
    const barsUpdate = barsGroup.selectAll('.bar')
    barsUpdate
      .attr('x', d => xScale(d.year.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))

    // Play highlight color
    if (isPlaying) {
      barsUpdate.attr('fill', (d, i) => {
        if (highlightedIndex === i) return highlightColor
        return getBarColor(d)
      })
    }

    barsJoin.exit().remove()

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


    // Transparent overlay rect for mouse tracking
    let overlayRect = g.select('.mouse-overlay')
    if (overlayRect.empty()) {
      overlayRect = g.append('rect').attr('class', 'mouse-overlay')
    }
    overlayRect
      .attr('x', 0).attr('y', 0)
      .attr('width', width).attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'default')
      .on('mousemove', function(event) {
        const [mx, my] = d3.pointer(event, this)
        const nearest = chartData.reduce((prev, curr) => {
          const px = (xScale(prev.year.toString()) || 0) + xScale.bandwidth() / 2
          const cx = (xScale(curr.year.toString()) || 0) + xScale.bandwidth() / 2
          return Math.abs(cx - mx) < Math.abs(px - mx) ? curr : prev
        })
        const cursorValue = yScale.invert(my)
        setTooltipData({
          x: mx + margin.left,
          y: my + margin.top,
          svgX: mx, svgY: my,
          cursorValue,
          data: nearest
        })
      })
      .on('mouseleave', function() {
        setTooltipData(null)
      })

  }, [dimensions, chartData, showLabels, showPercentChanges, showGrid, highlightedIndex, isPlaying, showTooltip])

  // Entrance animation: grow small bars first → large bars last (color set by D3 render)
  useEffect(() => {
    if (!isVisible || !svgRef.current) return
    const sortedByValue = [...chartData].sort((a, b) => a.value - b.value)
    const rankMap = new Map(sortedByValue.map((d, i) => [d.year, i]))
    d3.select(svgRef.current).selectAll('.bar')
      .each(function(d) {
        const rank = rankMap.get(d.year) ?? 0
        d3.select(this)
          .style('transition', `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${rank * 55}ms`)
          .style('transform', 'scaleY(1)')
      })
  }, [isVisible, chartData])

  // Smooth gradient update when user changes color in settings
  useEffect(() => {
    if (!isVisible || !svgRef.current) return
    const sortedByValue = [...chartData].sort((a, b) => a.value - b.value)
    const rankMap = new Map(sortedByValue.map((d, i) => [d.year, i]))
    const lightColor = d3.interpolateRgb(barColor, '#ffffff')(0.65)
    d3.select(svgRef.current).selectAll('.bar')
      .transition().duration(1200).ease(d3.easeCubicInOut)
      .attr('fill', d => {
        const rank = rankMap.get(d.year) ?? 0
        const t = rank / Math.max(chartData.length - 1, 1)
        return d3.interpolateRgb(lightColor, barColor)(t)
      })
  }, [barColor, isVisible])

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
        <div className="bg-gray-50 min-h-[calc(100vh-60px)] p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        <span className="font-semibold text-gray-900 block">{metric.label}</span>
                        <span className="text-xs text-gray-500">{metric.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-700 tracking-tight font-medium">
              {selectedMetric.description}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
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

            {/* Settings — custom floating panel */}
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => { setIsSettingsOpen(o => !o); setIsColorPickerVisible(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
                Settings
              </button>

              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 flex shadow-2xl rounded-xl overflow-hidden bg-white border border-gray-200">
                  {/* Color picker panel — shown left when Color is toggled */}
                  {isColorPickerVisible && (
                    <div className="p-4 border-r border-gray-100">
                      <ColorPicker color={barColor} onChange={handleColorChange} presets={colorPresets} />
                    </div>
                  )}

                  {/* Settings panel */}
                  <div className="p-4 min-w-[170px]">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Settings</div>

                    {[
                      { label: 'Show Labels',    value: showLabels,        set: setShowLabels },
                      { label: 'Show % Changes', value: showPercentChanges, set: setShowPercentChanges },
                      { label: 'Show Tooltip',   value: showTooltip,       set: setShowTooltip },
                      { label: 'Grid',           value: showGrid,          set: setShowGrid },
                    ].map(({ label, value, set }) => (
                      <label key={label} className="chart-settings-toggle">
                        <input type="checkbox" className="hidden" checked={value} onChange={() => set(v => !v)} readOnly />
                        <span className="chart-settings-checkbox" style={value ? { background: '#3b82f6', borderColor: '#3b82f6' } : {}}>
                          {value && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        {label}
                      </label>
                    ))}

                    {/* Color row — toggles color picker */}
                    <div
                      className="chart-settings-toggle mt-1 cursor-pointer"
                      onClick={() => setIsColorPickerVisible(v => !v)}
                    >
                      <span
                        className="chart-settings-color-dot"
                        style={{ backgroundColor: barColor }}
                      />
                      Color
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <div ref={containerRef} className="w-full overflow-x-auto min-h-[500px] relative">
              <svg ref={svgRef} className="w-full min-w-[800px]" />

              {/* Crosshair overlay */}
              {tooltipData && showTooltip && (() => {
                const cw = dimensions.width - CHART_MARGIN.left - CHART_MARGIN.right
                const ch = dimensions.height - CHART_MARGIN.top - CHART_MARGIN.bottom
                const yVal = tooltipData.cursorValue
                const label = selectedMetric.id === 'eps_diluted' || selectedMetric.id === 'eps_basic'
                  ? `$${yVal?.toFixed(1)}` : `$${yVal?.toFixed(0)}B`
                return (
                  <svg
                    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
                    width={dimensions.width} height={dimensions.height}
                  >
                    <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
                      <line x1={tooltipData.svgX} y1={0} x2={tooltipData.svgX} y2={ch} stroke="#9ca3af" strokeDasharray="5,4" strokeWidth={1} />
                      <line x1={0} y1={tooltipData.svgY} x2={cw} y2={tooltipData.svgY} stroke="#9ca3af" strokeDasharray="5,4" strokeWidth={1} />
                      <rect x={cw + 2} y={tooltipData.svgY - 10} width={52} height={20} rx={4} fill="#6b7280" />
                      <text x={cw + 28} y={tooltipData.svgY + 4} textAnchor="middle" fill="white" fontSize="10px" fontWeight="600">{label}</text>
                    </g>
                  </svg>
                )
              })()}

              {/* Custom Tooltip */}
              {tooltipData && showTooltip && (
                <div
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none z-50 text-xs min-w-[190px]"
                  style={{
                    left: Math.min(tooltipData.x, dimensions.width - 110),
                    top: Math.max(tooltipData.y - 120, 8),
                    transform: 'translate(-50%, 0)',
                    transition: 'left 0.08s ease-out, top 0.08s ease-out'
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
              <div className="text-xs text-gray-500 mt-1">
                {metricOptions[
                  metricOptions.findIndex(m => m.id === selectedMetric.id) > 0
                    ? metricOptions.findIndex(m => m.id === selectedMetric.id) - 1
                    : metricOptions.length - 1
                ].description}
              </div>
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
              <div className="text-xs text-green-100 mt-1">
                {metricOptions[
                  (metricOptions.findIndex(m => m.id === selectedMetric.id) + 1) % metricOptions.length
                ].description}
              </div>
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

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

function App() {
  const [backtestData, setBacktestData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 加载回测数据
    fetch('./data/backtest_summary.json')
      .then(res => res.json())
      .then(data => {
        setBacktestData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('加载数据失败:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  if (!backtestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">暂无回测数据</div>
      </div>
    )
  }

  const { version, results, comparison } = backtestData

  // 对比数据
  const comparisonData = comparison ? [
    { name: '胜率(%)', v63: comparison.v63?.win_rate || 0, v65: results.win_rate },
    { name: '平均收益(%)', v63: comparison.v63?.avg_return || 0, v65: results.avg_return },
    { name: '夏普比率', v63: comparison.v63?.sharpe_ratio || 0, v65: results.sharpe_ratio },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">杯柄策略回测结果</h1>
          <p className="mt-2 text-blue-100">版本: {version} | 生成时间: {new Date().toLocaleString()}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="总信号数" 
            value={results.total_signals} 
            subtitle="符合规则要求(≥1000)"
            color="blue"
          />
          <MetricCard 
            title="胜率" 
            value={`${results.win_rate}%`} 
            subtitle={results.win_rate >= 60 ? '✅ 达标' : '⚠️ 未达标(目标≥60%)'}
            color={results.win_rate >= 60 ? 'green' : 'yellow'}
          />
          <MetricCard 
            title="平均收益" 
            value={`${results.avg_return}%`} 
            subtitle="日均收益"
            color="blue"
          />
          <MetricCard 
            title="夏普比率" 
            value={results.sharpe_ratio} 
            subtitle={results.sharpe_ratio >= 0.5 ? '✅ 良好' : '⚠️ 一般'}
            color={results.sharpe_ratio >= 0.5 ? 'green' : 'yellow'}
          />
        </div>

        {/* 详细指标 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">详细指标</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailItem label="最大盈利" value={`${results.max_gain}%`} />
            <DetailItem label="最大亏损" value={`${results.max_loss}%`} />
            <DetailItem label="平均持仓天数" value={`${results.avg_hold_days}天`} />
            <DetailItem label="数据跨度" value="2023-2026 (3年)" />
          </div>
        </div>

        {/* 版本对比 */}
        {comparison && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">版本对比 (v6.3 vs v6.5)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="v63" name="v6.3 (基准)" fill="#94a3b8" />
                  <Bar dataKey="v65" name="v6.5 (优化)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 优化说明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">优化说明</h2>
          <div className="prose max-w-none">
            <ReactMarkdown>
              {backtestData.description || `
### v6.5 优化内容
- **杯深收紧**: 12-28% → 15-25%
- **柄深收紧**: ≤25% → ≤20%
- **新增杯形时间检查**: ≥20天
- **新增柄部缩量确认**

### 目标
- 胜率 ≥60%
- 保持收益水平
- 提高夏普比率
              `}
            </ReactMarkdown>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>由 OpenClaw Lens 自动生成 | 趋势分析系统</p>
        </div>
      </footer>
    </div>
  )
}

function MetricCard({ title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <h3 className="text-sm font-medium text-gray-600 uppercase">{title}</h3>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{subtitle}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  )
}

export default App

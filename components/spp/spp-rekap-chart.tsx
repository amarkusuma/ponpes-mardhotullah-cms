'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { RekapBulanan } from '@/lib/types/spp'

const BULAN_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
]

function formatRupiahShort(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
  return String(value)
}

interface IncomeChartProps {
  data: RekapBulanan[]
}

export function IncomeBarChart({ data }: IncomeChartProps) {
  const chartData = data.map((d) => ({
    name: BULAN_NAMES[d.bulan],
    'Total Tagihan': d.total_tagihan,
    'Terkumpul': d.total_masuk,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatRupiahShort} tick={{ fontSize: 11 }} width={48} />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
          }
        />
        <Bar dataKey="Total Tagihan" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Terkumpul" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface PaymentStatusChartProps {
  data: RekapBulanan[]
}

const STATUS_COLORS = ['#22c55e', '#f97316', '#ef4444']

export function PaymentStatusPieChart({ data }: PaymentStatusChartProps) {
  const totals = data.reduce(
    (acc, d) => ({
      lunas: acc.lunas + d.jumlah_lunas,
      cicilan: acc.cicilan + d.jumlah_cicilan,
      belum: acc.belum + d.jumlah_belum,
    }),
    { lunas: 0, cicilan: 0, belum: 0 }
  )

  const pieData = [
    { name: 'Lunas', value: Number(totals.lunas) },
    { name: 'Cicilan', value: Number(totals.cicilan) },
    { name: 'Belum Bayar', value: Number(totals.belum) },
  ].filter((d) => d.value > 0)

  if (pieData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-muted-foreground text-sm">
        Belum ada data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {pieData.map((_, index) => (
            <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} santri`, '']} />
        <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface MonthlyTrendLineProps {
  data: RekapBulanan[]
}

export function StatusStackedChart({ data }: MonthlyTrendLineProps) {
  const chartData = data.map((d) => ({
    name: BULAN_NAMES[d.bulan],
    Lunas: Number(d.jumlah_lunas),
    Cicilan: Number(d.jumlah_cicilan),
    'Belum Bayar': Number(d.jumlah_belum),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} width={32} />
        <Tooltip />
        <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
        <Bar dataKey="Lunas" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Cicilan" stackId="a" fill="#f97316" />
        <Bar dataKey="Belum Bayar" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

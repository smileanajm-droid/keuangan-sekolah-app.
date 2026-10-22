import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Building2, Plus, RefreshCw, CreditCard, UserCheck, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react'

// Konfigurasi Supabase Client
const supabaseUrl = import.meta.env.https://bgemjjxgtgefphxospnb.supabase.co || ''
const supabaseAnonKey = import.meta.env.sb_publishable_ccNd8IVl4J_Gp13eAz0t2w_1FnBECmU || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Komponen Statistik
function QuickStats({ transactions }) {
  const total = (transactions || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
        <p className="text-emerald-700 text-sm font-medium">Total Penerimaan</p>
        <h3 className="text-2xl font-bold text-emerald-900 mt-1">
          Rp {total.toLocaleString('id-ID')}
        </h3>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
        <p className="text-blue-700 text-sm font-medium">Transaksi Hari Ini</p>
        <h3 className="text-2xl font-bold text-blue-900 mt-1">
          {(transactions || []).length} Transaksi
        </h3>
      </div>
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
        <p className="text-purple-700 text-sm font-medium">Status System</p>
        <h3 className="text-lg font-bold text-purple-900 mt-1 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-purple-600" /> Terkoneksi Supabase
        </h3>
      </div>
    </div>
  )
}

// Komponen Tabel Transaksi
function TransactionList({ transactions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">
        Riwayat Transaksi Terbaru
      </div>
      <div className="divide-y divide-slate-100">
        {(!transactions || transactions.length === 0) ? (
          <div className="p-6 text-center text-slate-400">Belum ada transaksi recorded.</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id || Math.random()} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">{tx.student_name}</p>
                <p className="text-xs text-slate-500">{tx.unit_code} • {tx.category} • {tx.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">+Rp {(Number(tx.amount) || 0).toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Komponen Utama
export default function App() {
  const [unit, setUnit] = useState('SD')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const [studentName, setStudentName] = useState('')
  const [category, setCategory] = useState('SPP')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('CASH')

  useEffect(() => {
    fetchTransactions()
  }, [unit])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('unit_code', unit)
        .order('created_at', { ascending: false })

      if (!error && data) setTransactions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    if (!studentName || !amount) return alert('Isi semua data!')

    const newTx = {
      invoice_number: 'INV-' + Date.now(),
      student_name: studentName,
      unit_code: unit,
      category,
      amount: parseFloat(amount),
      payment_method: method
    }

    const { data, error } = await supabase.from('transactions').insert([newTx]).select()

    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      setTransactions([data[0], ...transactions])
      setStudentName('')
      setAmount('')
      alert('Transaksi Berhasil Simpan!')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-emerald-600" /> Keuangan Sekolah
            </h1>
            <p className="text-slate-500 text-sm">Sistem Kasir & Pembayaran Multi-Unit</p>
          </div>
          <div className="flex gap-2">
            {['TK', 'SD', 'SMP', 'Pesantren'].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  unit === u
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <QuickStats transactions={transactions} />

        {/* Layout Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Input Kasir */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> Input Pembayaran ({unit})
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Ahmad"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Pembayaran</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="SPP">SPP Bulanan</option>
                  <option value="Gedung">Uang Gedung</option>
                  <option value="Seragam">Seragam & Buku</option>
                  <option value="Infaq">Infaq / Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Bayar</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="CASH">Tunai (Kasir)</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-3 rounded-lg shadow-md transition-all mt-2"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>

          {/* Tabel Riwayat */}
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions} />
          </div>

        </div>

      </div>
    </div>
  )
}

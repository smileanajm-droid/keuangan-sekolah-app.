import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { QuickStats, TransactionList } from './components/FinanceModule.jsx'
import { Building2, Plus, RefreshCw, CreditCard } from 'lucide-react'

export default function App() {
  const [unit, setUnit] = useState('SD')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [studentName, setStudentName] = useState('')
  const [category, setCategory] = useState('SPP')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('CASH')

  useEffect(() => {
    fetchTransactions()
  }, [unit])

  async function fetchTransactions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('unit_code', unit)
      .order('created_at', { ascending: false })

    if (!error && data) setTransactions(data)
    setLoading(false)
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
      payment_method: method,
      status: 'SUCCESS'
    }

    const { error } = await supabase.from('transactions').insert([newTx])
    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      setStudentName('')
      setAmount('')
      fetchTransactions()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sistem Keuangan Yayasan</h1>
            <p className="text-xs text-slate-500">Aplikasi Kasir & Administrasi Sekolah</p>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex gap-2">
          {['TK', 'SD', 'SMP', 'PESANTREN'].map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                unit === u ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <QuickStats transactions={transactions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input Pembayaran */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Transaksi Baru ({unit})
          </h2>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nama Siswa</label>
              <input
                type="text"
                placeholder="Contoh: Ahmad Rizky"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Kategori Tagihan</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
              >
                <option value="SPP">SPP Bulanan</option>
                <option value="INFAQ_GEDUNG">Infaq Gedung / Bangunan</option>
                <option value="KEGIATAN">Uang Kegiatan</option>
                <option value="EKSTRA">Ekstrakurikuler</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Jumlah Nominal (Rp)</label>
              <input
                type="number"
                placeholder="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Metode Pembayaran</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
              >
                <option value="CASH">Tunai (Cash)</option>
                <option value="TRANSFER">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Simpan Pembayaran
            </button>
          </form>
        </div>

        {/* Tabel Riwayat */}
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  )
      }

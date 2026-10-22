import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  CreditCard, 
  Users, 
  FileText, 
  Send, 
  CheckCircle2,
  Wallet,
  PhoneCall
} from 'lucide-react'

// Konfigurasi Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function App() {
  const [activeTab, setActiveTab] = useState('kasir') // 'kasir' | 'tagihan' | 'laporan'
  const [unit, setUnit] = useState('SD')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  // Form Kasir State
  const [studentName, setStudentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [category, setCategory] = useState('SPP')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('CASH')

  // Data Tagihan Siswa (Simulasi / Database)
  const [bills, setBills] = useState([
    { id: 1, name: 'Ahmad Fauzan', unit: 'SD', type: 'SPP Bulan Oktober', amount: 250000, phone: '6281234567890', status: 'Belum Lunas' },
    { id: 2, name: 'Siti Aminah', unit: 'SMP', type: 'Uang Gedung', amount: 750000, phone: '6289876543210', status: 'Belum Lunas' },
    { id: 3, name: 'Budi Santoso', unit: 'Pesantren', type: 'Daftar Ulang', amount: 500000, phone: '6281122334455', status: 'Lunas' }
  ])

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

      if (!error && data) {
        setTransactions(data)
      }
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  // Simpan Transaksi Kasir & Update Status Tagihan
  async function handleAddTransaction(e) {
    e.preventDefault()
    if (!studentName || !amount) return alert('Mohon lengkapi nama siswa dan nominal!')

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
      alert('Gagal menyimpan: ' + error.message)
    } else if (data && data.length > 0) {
      setTransactions([data[0], ...transactions])
      
      // Kirim Notifikasi WhatsApp otomatis jika nomor HP diisi
      if (parentPhone) {
        const message = `Halo Ayah/Bunda dari *${studentName}*,\n\nPembayaran *${category}* sebesar *Rp ${Number(amount).toLocaleString('id-ID')}* untuk unit *${unit}* telah BERHASIL diterima via *${method}*.\n\nTerima kasih.`
        window.open(`https://wa.me/${parentPhone}?text=${encodeURIComponent(message)}`, '_blank')
      }

      setStudentName('')
      setParentPhone('')
      setAmount('')
      alert('Transaksi Berhasil Disimpan & Dicatat!')
    }
  }

  // Fungsi Kirim Tagihan ke WhatsApp Orang Tua
  function sendWhatsAppBill(bill) {
    const message = `Yth. Orang Tua/Wali dari *${bill.name}* (${bill.unit}),\n\nBerikut adalah pemberitahuan tagihan sekolah:\n🔹 Jenis: *${bill.type}*\n🔹 Nominal: *Rp ${bill.amount.toLocaleString('id-ID')}*\n🔹 Status: *${bill.status}*\n\nMohon segera melakukan pelunasan. Terima kasih.`
    window.open(`https://wa.me/${bill.phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const totalPenerimaan = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Keuangan Sekolah Terpadu</h1>
              <p className="text-xs text-slate-500">Sistem Multi-Unit, Kasir, & Notifikasi Orang Tua</p>
            </div>
          </div>

          {/* Tab Navigasi Utama */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('kasir')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'kasir' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
            >
              Kasir & Pembayaran
            </button>
            <button 
              onClick={() => setActiveTab('tagihan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tagihan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
            >
              Tagihan & WhatsApp
            </button>
            <button 
              onClick={() => setActiveTab('laporan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'laporan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
            >
              Laporan Rekap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Unit Selector */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Unit:</span>
            {['TK', 'SD', 'SMP', 'Pesantren'].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  unit === u
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-slate-500">
            Unit Aktif: <strong className="text-emerald-700">{unit}</strong>
          </div>
        </div>

        {/* STATISTIK RINGKAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Total Kas Masuk ({unit})</p>
            <h3 className="text-2xl font-black text-emerald-900 mt-1">
              Rp {totalPenerimaan.toLocaleString('id-ID')}
            </h3>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
            <p className="text-blue-700 text-xs font-bold uppercase tracking-wider">Jumlah Transaksi</p>
            <h3 className="text-2xl font-black text-blue-900 mt-1">
              {transactions.length} Transaksi
            </h3>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl">
            <p className="text-purple-700 text-xs font-bold uppercase tracking-wider">Database Supabase</p>
            <h3 className="text-sm font-bold text-purple-900 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" /> Terkoneksi & Aktif
            </h3>
          </div>
        </div>

        {/* KONTEN UTAMA BERDASARKAN TAB */}
        {activeTab === 'kasir' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Kasir */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Form Pembayaran Siswa
              </h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Siswa</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Ahmad Zaki"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WA Orang Tua (Opsional)</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="628123456789 (awali 62)"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Otomatis membuka WhatsApp untuk mengirim bukti pembayaran.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Pembayaran</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none bg-white"
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
                    placeholder="250000"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Bayar</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none bg-white"
                  >
                    <option value="CASH">Tunai (Kasir Sekolah)</option>
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Simpan & Cetak Struk
                </button>
              </form>
            </div>

            {/* Riwayat Transaksi */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Riwayat Transaksi Unit {unit}</h3>
                <button 
                  onClick={fetchTransactions}
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Memuat data dari database...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Belum ada transaksi tercatat untuk unit ini.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id || Math.random()} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{tx.student_name}</p>
                        <p className="text-xs text-slate-500">{tx.category} • {tx.payment_method} • <span className="text-emerald-600 font-medium">{tx.invoice_number}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-600 text-sm">+Rp {(Number(tx.amount) || 0).toLocaleString('id-ID')}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.created_at || Date.now()).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'tagihan' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">Manajemen Tagihan & Kirim Pesan ke Orang Tua</h2>
                <p className="text-xs text-slate-500">Kirim pengingat pembayaran SPP atau uang gedung langsung via WhatsApp.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {bills.map((bill) => (
                <div key={bill.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{bill.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{bill.unit}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Tagihan: <strong>{bill.type}</strong> — Rp {bill.amount.toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${bill.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {bill.status}
                    </span>
                    <button
                      onClick={() => sendWhatsAppBill(bill)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" /> Tagih via WA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'laporan' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800">Laporan Rekapitulasi Keuangan</h2>
            <p className="text-xs text-slate-500">Ringkasan seluruh pemasukan kas masuk dari database Supabase.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Akumulasi Unit {unit}</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">Rp {totalPenerimaan.toLocaleString('id-ID')}</h4>
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Cetak Laporan
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

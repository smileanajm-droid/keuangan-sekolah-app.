import React from 'react'
import { PlusCircle, Receipt, UserCheck, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export function QuickStats({ transactions }) {
  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0)
  
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
          {transactions.length} Transaksi
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

export function TransactionList({ transactions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">
        Riwayat Transaksi Terbaru
      </div>
      <div className="divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-slate-400">Belum ada transaksi recorded.</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <p className="font-semibold text-slate-800">{tx.student_name}</p>
                <p className="text-xs text-slate-500">{tx.unit_code} • {tx.category} • {tx.payment_method}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">+Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleTimeString('id-ID')}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

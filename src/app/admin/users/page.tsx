'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Search, Users } from 'lucide-react'
import { UserProfile } from '@/types'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
      setUsers(snap.docs.map((d) => d.data() as UserProfile))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.college ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-sm">{users.length} registered students</p>
      </div>

      <Input
        placeholder="Search by name, email, or college..."
        icon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-card overflow-hidden">
        <div className="hidden md:grid grid-cols-5 px-5 py-3 bg-secondary text-xs font-semibold text-text-secondary uppercase tracking-wide">
          <span className="col-span-2">Student</span>
          <span>Phone</span>
          <span>College</span>
          <span>Role</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={32} className="text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No students found</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.uid}
              className="grid grid-cols-1 md:grid-cols-5 px-5 py-4 border-t border-purple-50 gap-2 md:gap-0 hover:bg-secondary/50 transition-colors"
            >
              <div className="md:col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {u.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">{u.name}</p>
                  <p className="text-xs text-text-secondary">{u.email}</p>
                </div>
              </div>
              <div className="text-sm text-text-secondary flex items-center">{u.phone || '—'}</div>
              <div className="text-sm text-text-secondary flex items-center">{u.college || '—'}</div>
              <div className="flex items-center">
                <Badge status={u.role} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

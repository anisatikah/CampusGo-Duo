'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { StorageOrder, RunnerOrder, PrintingOrder } from '@/types'
import { useAuth } from '@/context/AuthContext'

export function useStorageOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<StorageOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'storage_orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StorageOrder)))
      setLoading(false)
    })
    return unsub
  }, [user])

  const createOrder = async (data: Omit<StorageOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addDoc(collection(db, 'storage_orders'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return { orders, loading, createOrder }
}

export function useRunnerOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<RunnerOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'runner_orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RunnerOrder)))
      setLoading(false)
    })
    return unsub
  }, [user])

  const createOrder = async (data: Omit<RunnerOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addDoc(collection(db, 'runner_orders'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return { orders, loading, createOrder }
}

export function usePrintingOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<PrintingOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'printing_orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrintingOrder)))
      setLoading(false)
    })
    return unsub
  }, [user])

  const createOrder = async (data: Omit<PrintingOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addDoc(collection(db, 'printing_orders'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return { orders, loading, createOrder }
}

export function useAllOrders() {
  const { user } = useAuth()
  const [storageOrders, setStorageOrders] = useState<StorageOrder[]>([])
  const [runnerOrders, setRunnerOrders] = useState<RunnerOrder[]>([])
  const [printingOrders, setPrintingOrders] = useState<PrintingOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let loaded = 0
    const check = () => { loaded++; if (loaded === 3) setLoading(false) }

    const q1 = query(collection(db, 'storage_orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    const q2 = query(collection(db, 'runner_orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    const q3 = query(collection(db, 'printing_orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))

    const u1 = onSnapshot(q1, (s) => { setStorageOrders(s.docs.map((d) => ({ id: d.id, ...d.data() } as StorageOrder))); check() })
    const u2 = onSnapshot(q2, (s) => { setRunnerOrders(s.docs.map((d) => ({ id: d.id, ...d.data() } as RunnerOrder))); check() })
    const u3 = onSnapshot(q3, (s) => { setPrintingOrders(s.docs.map((d) => ({ id: d.id, ...d.data() } as PrintingOrder))); check() })

    return () => { u1(); u2(); u3() }
  }, [user])

  return { storageOrders, runnerOrders, printingOrders, loading }
}

export async function updateOrderStatus(
  collection_name: string,
  orderId: string,
  status: string,
) {
  await updateDoc(doc(db, collection_name, orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  category: string | null
  active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  active: boolean
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface AppointmentService {
  id: string
  appointment_id: string
  service_id: string | null
  service_name: string
  price_at_time: number
}

export interface AppointmentProduct {
  id: string
  appointment_id: string
  product_id: string | null
  product_name: string
  quantity: number
  price_at_time: number
}

export type PaymentMethod = 'cash' | 'transfer'
export type DiscountType = 'percent' | 'fixed'

export interface Payment {
  id: string
  appointment_id: string
  method: PaymentMethod
  subtotal: number
  discount_type: DiscountType | null
  discount_value: number
  total: number
  paid_at: string
}

export interface Appointment {
  id: string
  client_id: string | null
  date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  client?: Client
  appointment_services?: AppointmentService[]
  appointment_products?: AppointmentProduct[]
  payment?: Payment
}

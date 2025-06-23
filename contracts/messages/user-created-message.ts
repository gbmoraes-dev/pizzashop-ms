export interface UserCreatedMessage {
  userId: string
  name: string
  email: string
  role: 'customer' | 'manager'
  createdAt: Date
  updatedAt: Date
}

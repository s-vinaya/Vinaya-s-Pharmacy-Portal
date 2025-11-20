// User and Authentication Types
export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  phoneNumber?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  licenseExpiryDate?: string;
  qualification?: string;
  stateOfLicense?: string;
  createdAt: string;
  name?: string;
}

export interface RegisterCustomerDto {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterPharmacistDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  yearsOfExperience: number;
  licenseExpiryDate: string;
  qualification: string;
  stateOfLicense: string;
}

export interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

// Medicine Types
export interface Medicine {
  medicineId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  manufacturer?: string;
  expiryDate?: string;
  categoryId?: number;
  categoryName?: string;
  imageUrl?: string;
  requiresPrescription?: boolean;
  createdBy?: number;
}

// Category Types
export interface Category {
  categoryId: number;
  categoryName?: string;
  name?: string;
}

// Prescription Types
export interface Prescription {
  prescriptionId: number;
  userId: number;
  filePath?: string;
  fileUrl?: string;
  uploadedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Verified';
  remarks?: string;
  verifiedBy?: number;
  verifiedAt?: string;
}

// Order Types
export interface OrderItem {
  orderItemId?: number;
  orderId?: number;
  medicineId: number;
  medicineName?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
}

export interface Order {
  orderId: number;
  userId: number;
  addressId?: number;
  prescriptionId?: number;
  totalAmount?: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems?: OrderItem[];
  address?: Address;
  prescription?: Prescription;
}

// Address Types
export interface Address {
  addressId: number;
  userId: number;
  fullName?: string;
  phoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault?: boolean;
}

// Cart Types
export interface CartItem {
  cartItemId?: number;
  userId?: number;
  medicineId: number;
  medicineName?: string;
  name?: string;
  quantity: number;
  price: number;
  medicine?: Medicine;
  stock?: number;
  requiresPrescription?: boolean;
}

// Form Types
export interface MedicineFormData {
  name: string;
  description: string;
  price: string | number;
  stock: string | number;
  expiryDate: string;
  categoryId: number | string;
  requiresPrescription: boolean;
  createdBy: number;
  imageUrl: string;
}



// Dashboard Data Types
export interface AdminDashboardData {
  usersCount: number;
  medicinesCount: number;
  ordersCount: number;
  prescriptionsCount: number;
}

export interface CustomerDashboardData {
  myOrdersCount: number;
  myPrescriptionsCount: number;
}

export interface PharmacistDashboardData {
  ordersCount: number;
  activeOrdersCount: number;
  prescriptionsCount: number;
  medicinesCount: number;
}

// Activity and Alert Types
export interface RecentActivity {
  type: string;
  action: string;
  time: string;
}

export interface SystemAlerts {
  lowStockAlert: { title: string; message: string };
  pendingReviews: { title: string; message: string };
  systemStatus: { title: string; message: string };
}

// Snackbar Types
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Cart Context Types
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (medicine: any) => void;
  removeFromCart: (medicineId: number) => void;
  updateQuantity: (medicineId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  getUniqueItemsCount: () => number;
}



// Additional interfaces from components
export interface OrderFormDataAdmin {
  status?: string;
}

export interface PrescriptionAdmin extends Prescription {
  medicines?: PrescriptionMedicine[];
}

export interface PrescriptionMedicine {
  medicineId: number;
  medicineName?: string;
  quantity: number;
  dosage?: string;
  instructions?: string;
}

// User Management interfaces
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  status: string;
}

export interface UserAdmin extends User {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  contactNumber?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  qualification?: string;
  stateOfLicense?: string;
  licenseExpiryDate?: string;
  status: string;
}

// Profile specific interfaces
export interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

// Pharmacist Medicine Inventory interfaces
export interface MedicineInventoryFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string | number;
  requiresPrescription: boolean;
  imageUrl: string;
  expiryDate: string;
}

// Customer interfaces
export interface CustomerOrderItem {
  medicineId: number;
  medicineName?: string;
  quantity: number;
  price?: number;
}

export interface CustomerOrder {
  orderId: number;
  totalAmount?: number;
  createdAt: string;
  status: string;
  orderItems?: CustomerOrderItem[];
}

export interface CustomerPrescription {
  prescriptionId: number;
  uploadedAt: string;
  status: string;
  remarks?: string;
}

// Pharmacist interfaces
export interface PharmacistOrderItem {
  medicineId: number;
  medicineName?: string;
  quantity?: number;
  price?: number;
}

export interface PharmacistOrder {
  orderId: number;
  userId: number;
  addressId?: number;
  prescriptionId?: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
  orderItems?: PharmacistOrderItem[];
  address?: any;
}

export interface PharmacistPrescription {
  prescriptionId: number;
  userId: number;
  uploadedAt: string;
  status: string;
  fileUrl?: string;
  filePath?: string;
  remarks?: string;
}
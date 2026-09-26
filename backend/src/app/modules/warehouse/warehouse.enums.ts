export enum ProductStatus {
  NEW = 'NEW', // جديد
  AVAILABLE = 'AVAILABLE', // متاح
  OUT_OF_STOCK = 'OUT_OF_STOCK', // غير متوفر
  PENDING = 'PENDING', // قيد التوريد
  RESERVED = 'RESERVED', // محجوز
  DISCONTINUED = 'DISCONTINUED', // متوقف
}

export enum ProductCondition {
  NEW = 'NEW', // جديد
  USED = 'USED', // مستعمل
  DAMAGED = 'DAMAGED', // تالف
  EXPIRED = 'EXPIRED', // منتهي الصلاحية
  REFURBISHED = 'REFURBISHED', // مجدد
}

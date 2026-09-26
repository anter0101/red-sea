/**
 * Generates src/i18n/locales/errors.json (English keys → Arabic + regex patterns).
 * Run: node scripts/generate-errors-json.js
 */
const fs = require('fs');
const path = require('path');

/** Static messages — English → Arabic */
const exact = {
  'A non-zero opening balance is not allowed under this account because the branch already has posted transactions. Create the account with opening balance 0.':
    'لا يُسمح برصيد افتتاحي غير صفري تحت هذا الحساب لوجود قيود مرحّلة. أنشئ الحساب برصيد افتتاحي 0.',
  'An account cannot be its own parent': 'لا يمكن أن يكون الحساب أباً لنفسه',
  'Available balance is not enough': 'الرصيد المتاح غير كافٍ',
  'Axle cannot be assigned to both car and trailer': 'لا يمكن ربط المحور بسيارة ومقطورة في آن واحد',
  'Both bankAccountNumber and bankName must be provided together or both must be empty':
    'يجب إدخال رقم الحساب البنكي واسم البنك معاً أو تركهما فارغين',
  'Cannot assign axle to both car and trailer': 'لا يمكن تعيين المحور لسيارة ومقطورة معاً',
  'Child accounts inherit normalBalance from the parent. Omit normalBalance when creating under a parent.':
    'الحسابات الفرعية ترث طبيعة الرصيد من الحساب الأب. لا ترسل normalBalance عند الإنشاء تحت حساب أب.',
  'Custody account not found': 'لم يتم العثور على حساب العهدة',
  'Custody can only be assigned to users with EMPLOYEE role':
    'يمكن تعيين العهدة للمستخدمين بدور موظف فقط',
  'Duplicate car ownerships found': 'تم العثور على ملكيات سيارات مكررة',
  'Duplicate contact phone numbers found': 'تم العثور على أرقام هواتف مكررة في جهات الاتصال',
  'Duplicate owner IDs found in the request': 'تم العثور على معرفات مالكين مكررة في الطلب',
  'Duplicate trailer ownerships found': 'تم العثور على ملكيات مقطورات مكررة',
  'Each account should appear once': 'يجب أن يظهر كل حساب مرة واحدة فقط',
  'Each axle must include an id for update': 'يجب أن يتضمن كل محور معرفاً للتحديث',
  'Each axle must include either carId or trailerId': 'يجب أن يتضمن كل محور carId أو trailerId',
  'Each contact must include an id.': 'يجب أن تتضمن كل جهة اتصال معرفاً.',
  'Either carId or trailerId must be provided': 'يجب توفير carId أو trailerId',
  'Employee custody account was not created': 'لم يتم إنشاء حساب عهدة الموظف',
  'Failed to fetch GPS devices from external API': 'فشل جلب أجهزة GPS من الخدمة الخارجية',
  'Gps connection error': 'خطأ في الاتصال بخدمة GPS',
  'Grid not found for this user and pageKey': 'لم يتم العثور على الشبكة لهذا المستخدم والصفحة',
  'Invalid login email or password!': 'البريد الإلكتروني أو كلمة المرور غير صحيحة!',
  'Inventory account not found': 'لم يتم العثور على حساب المخزون',
  'No transaction ids provided for bulk update': 'لم يتم توفير معرفات قيود للتحديث الجماعي',
  'Only one of carId or trailerId should be provided': 'يجب توفير carId أو trailerId فقط وليس كلاهما',
  'Opening balance can only be set on leaf accounts.':
    'يمكن تعيين الرصيد الافتتاحي على الحسابات النهائية فقط.',
  'Opening balance can only be set when the current opening balance is zero.':
    'يمكن تعيين الرصيد الافتتاحي فقط عندما يكون الرصيد الافتتاحي الحالي صفراً.',
  'Opening balance cannot be changed while the account has transaction lines.':
    'لا يمكن تغيير الرصيد الافتتاحي بينما للحساب قيود محاسبية.',
  'Opening balance has already been set for this account and cannot be changed.':
    'تم تعيين الرصيد الافتتاحي مسبقاً ولا يمكن تغييره.',
  'Provide either car id or inline car fields, not both':
    'قدّم إما معرف السيارة أو حقول السيارة المضمنة، وليس كلاهما',
  'Provide either carId or inline car fields, not both':
    'قدّم إما carId أو حقول السيارة المضمنة، وليس كلاهما',
  'Provide either driver id or inline driver fields, not both':
    'قدّم إما معرف السائق أو حقول السائق المضمنة، وليس كلاهما',
  'Provide either driverId or inline driver fields, not both':
    'قدّم إما driverId أو حقول السائق المضمنة، وليس كلاهما',
  'Provide either flat asset id or inline asset fields, not both':
    'قدّم إما معرف الأصل أو حقول الأصل المضمنة، وليس كلاهما',
  'Provide either trailer id or inline trailer fields, not both':
    'قدّم إما معرف المقطورة أو حقول المقطورة المضمنة، وليس كلاهما',
  'Provide either trailerId or inline trailer fields, not both':
    'قدّم إما trailerId أو حقول المقطورة المضمنة، وليس كلاهما',
  'Request body must be a non-empty array': 'يجب أن يكون جسم الطلب مصفوفة غير فارغة',
  'Root accounts must include both type and normalBalance (no parent to inherit from).':
    'يجب أن تتضمن الحسابات الجذرية النوع وطبيعة الرصيد (لا يوجد حساب أب للوراثة).',
  'Salary record already exists for this user': 'سجل الراتب موجود مسبقاً لهذا المستخدم',
  'This account is part of the system chart of accounts and cannot be deleted.':
    'هذا الحساب جزء من دليل الحسابات النظامي ولا يمكن حذفه.',
  'This account is part of the system chart of accounts and cannot be modified.':
    'هذا الحساب جزء من دليل الحسابات النظامي ولا يمكن تعديله.',
  'Transaction is not balanced: debits must equal credits':
    'القيد غير متوازن: يجب أن تساوي المدين الدائن',
  'Transaction must contain at least two transaction lines':
    'يجب أن يحتوي القيد على سطرين محاسبيين على الأقل',
  'Unknown generator type': 'نوع المولّد غير معروف',
  'Unknown role for username generator': 'الدور غير معروف لمولّد اسم المستخدم',
  'Your account is not been activated!': 'لم يتم تفعيل حسابك!',
  'areaId is required': 'areaId مطلوب',
  'car assignment is required': 'تعيين السيارة مطلوب',
  'car id or inline car payload is required': 'معرف السيارة أو بيانات السيارة المضمنة مطلوب',
  'clientId is required': 'clientId مطلوب',
  'driver assignment is required': 'تعيين السائق مطلوب',
  'driver id or inline driver payload is required': 'معرف السائق أو بيانات السائق المضمنة مطلوب',
  'driver.user is required when creating a driver inline':
    'driver.user مطلوب عند إنشاء سائق مضمّن',
  'governmentId is required': 'governmentId مطلوب',
  'items must contain at least one entry': 'يجب أن تحتوي items على عنصر واحد على الأقل',
  'name is required': 'الاسم مطلوب',
  'trailer assignment is required': 'تعيين المقطورة مطلوب',
  'trailer id or inline trailer payload is required':
    'معرف المقطورة أو بيانات المقطورة المضمنة مطلوب',
  'vehicleMode is required': 'vehicleMode مطلوب',
  'vehicleMode is required when updating car assignment':
    'vehicleMode مطلوب عند تحديث تعيين السيارة',
  'vehicleMode is required when updating driver assignment':
    'vehicleMode مطلوب عند تحديث تعيين السائق',
  'vehicleMode is required when updating trailer assignment':
    'vehicleMode مطلوب عند تحديث تعيين المقطورة',
  // class-validator common messages (suffix — also matched on "propertyName {suffix}")
  'must be a string': 'يجب أن يكون نصاً',
  'must be an email': 'يجب أن يكون بريداً إلكترونياً صالحاً',
  'must be a number': 'يجب أن يكون رقماً',
  'must be an integer number': 'يجب أن يكون عدداً صحيحاً',
  'should not be empty': 'يجب ألا يكون فارغاً',
  'must be a boolean value': 'يجب أن يكون قيمة منطقية',
  'must be a positive number': 'يجب أن يكون رقماً موجباً',
  'must be a valid enum value': 'يجب أن يكون قيمة تعداد صالحة',
  'User data is required': 'بيانات المستخدم مطلوبة',
  'branchId must be an integer': 'branchId يجب أن يكون عدداً صحيحاً',
  'Amount must be greater than zero': 'المبلغ يجب أن يكون أكبر من صفر',
  'Delegation for this journey is already marked as printed':
    'تم وسم تفويض هذه الرحلة كمطبوع مسبقاً',
  'requestedFromId is required': 'requestedFromId مطلوب',
  'Requesting employee has no associated user': 'الموظف الطالب ليس له مستخدم مرتبط',
  'custody.targetEmployeeId is required when transferTo is EMPLOYEE':
    'يجب اختيار الموظف عند التحويل إلى موظف',
  'custody.sourceEmployeeId is required when transferFrom is EMPLOYEE':
    'يجب اختيار الموظف عند التحويل من موظف',
  'Treasury account (الخزينه) not found': 'لم يتم العثور على حساب الخزينة',
  'No admin employee configured for office requests. Create an employee linked to an ADMIN user or pass requestedToId.':
    'لا يوجد موظف مسؤول مرتبط بطلبات المكتب. أنشئ موظفاً مرتبطاً بمستخدم ADMIN أو أرسل requestedToId.',
  'No admin employee configured for office requests. Create an employee linked to an ADMIN user.':
    'لا يوجد موظف مسؤول مرتبط بطلبات المكتب. أنشئ موظفاً مرتبطاً بمستخدم ADMIN.',
  'Cannot approve end-of-shift custody transfer before policy is collected':
    'لا يمكن الموافقة على تحويل عهدة إنهاء الوردية قبل تحصيل البوليصة',
  'Cannot approve custody request after invoice is issued':
    'لا يمكن الموافقة على طلب العهدة بعد إصدار الفاتورة',
  'type is required': 'النوع مطلوب',
  'Person name is required to create sub-accounts': 'اسم الشخص مطلوب لإنشاء الحسابات الفرعية',
  'user does not exist': 'المستخدم غير موجود',
  // HTTP status labels (Nest default exception.error)
  'Bad Request': 'طلب غير صالح',
  'Not Found': 'غير موجود',
  'Unauthorized': 'غير مصرح',
  'Forbidden': 'ممنوع',
  'Conflict': 'تعارض',
  'Internal Server Error': 'خطأ داخلي في الخادم',
  'Forbidden resource': 'غير مسموح بالوصول إلى هذا المورد',
  'employeeId is required for admin users': 'employeeId مطلوب لمستخدمي ADMIN',
  'journeyId is required for PRINT_DELEGATION requests':
    'journeyId مطلوب لطلبات PRINT_DELEGATION',
};

const entities = {
  Account: 'الحساب',
  'Parent account': 'الحساب الأب',
  User: 'المستخدم',
  Driver: 'السائق',
  Car: 'السيارة',
  Trailer: 'المقطورة',
  Journey: 'الرحلة',
  Employee: 'الموظف',
  Branch: 'الفرع',
  Client: 'العميل',
  Area: 'المنطقة',
  'Area (delivery site)': 'موقع التسليم',
  Government: 'المحافظة',
  Contact: 'جهة الاتصال',
  Custody: 'العهدة',
  DeliveryPrice: 'سعر التوصيل',
  PriceType: 'نوع السعر',
  Owner: 'المالك',
  Supplier: 'المورد',
  Warehouse: 'المستودع',
  'Warehouse item': 'صنف المستودع',
  GpsDevice: 'جهاز GPS',
  GpsTail: 'سجل GPS',
  Grid: 'الشبكة',
  'Office request': 'طلب المكتب',
  Policy: 'البوليصة',
  Transaction: 'القيد',
  'Transaction line': 'سطر القيد',
  Salary: 'الراتب',
  Tire: 'الإطار',
  Axle: 'المحور',
  'Car attachment': 'مرفق السيارة',
  'Trailer attachment': 'مرفق المقطورة',
  'Car manufacturer': 'شركة تصنيع السيارات',
  'Trailer manufacturer': 'شركة تصنيع المقطورات',
  'User attachment': 'مرفق المستخدم',
  'Assistant driver': 'مساعد السائق',
  Attachment: 'المرفق',
  'Driver account': 'حساب السائق',
  'Employee account': 'حساب الموظف',
  'Delegation print record': 'سجل طباعة التفويض',
};

/** class-validator / ValidationPipe message patterns */
const validationPatterns = [
  {
    regex: '^(.+?) must be one of the following values: (.+)$',
    ar: '{{1}} يجب أن يكون أحد القيم التالية: {{2}}',
  },
  {
    regex: '^(.+?) must not be less than (.+)$',
    ar: '{{1}} يجب ألا يقل عن {{2}}',
  },
  {
    regex: '^(.+?) must not be greater than (.+)$',
    ar: '{{1}} يجب ألا يزيد عن {{2}}',
  },
  {
    regex: '^each value in (.+?) must be an integer number$',
    ar: 'كل قيمة في {{1}} يجب أن تكون عدداً صحيحاً',
  },
  {
    regex: '^nested property (.+?) must be either object or array$',
    ar: 'الخاصية المتداخلة {{1}} يجب أن تكون كائناً أو مصفوفة',
  },
  {
    regex: '^property (.+?) should not exist$',
    ar: 'الخاصية {{1}} يجب ألا تكون موجودة',
  },
];

/** Regex patterns — first match wins (most specific first) */
const patterns = [
  {
    regex: '^Account with id (\\d+) is not a leaf account\\. Post only to accounts with no sub-accounts\\.$',
    ar: 'الحساب برقم {{1}} ليس حساباً نهائياً. يُرحّل فقط إلى حسابات بلا حسابات فرعية.',
  },
  {
    regex: '^Cannot delete account "(.+)" because it has (\\d+) child account\\(s\\)\\. Remove or reassign child accounts first\\.$',
    ar: 'لا يمكن حذف الحساب "{{1}}" لوجود {{2}} حساب/حسابات فرعية. أزل أو أعد تعيين الحسابات الفرعية أولاً.',
  },
  {
    regex: '^Cannot delete account "(.+)" because it has (\\d+) transaction line\\(s\\) linked to it\\.$',
    ar: 'لا يمكن حذف الحساب "{{1}}" لارتباط {{2}} سطر/أسطر قيد به. ',
  },
  {
    regex: '^Circular reference detected: account (\\d+) is already a descendant of account (\\d+)$',
    ar: 'مرجع دائري: الحساب {{1}} فرع من الحساب {{2}} بالفعل',
  },
  {
    regex: '^For account type "(.+)", normalBalance must be DEBIT\\.$',
    ar: 'لنوع الحساب "{{1}}" يجب أن تكون طبيعة الرصيد مدينة (DEBIT).',
  },
  {
    regex: '^For account type "(.+)", normalBalance must be CREDIT\\.$',
    ar: 'لنوع الحساب "{{1}}" يجب أن تكون طبيعة الرصيد دائنة (CREDIT).',
  },
  {
    regex: '^Account type "(.+)" is not allowed under a "(.+)" parent\\. Use "(.+)"(, or CASH for cash/bank style accounts\\.)?$',
    ar: 'نوع الحساب "{{1}}" غير مسموح تحت حساب أب من نوع "{{2}}". استخدم "{{3}}".',
  },
  {
    regex: '^Account (\\d+) not found$',
    ar: 'لم يتم العثور على الحساب برقم {{1}}',
  },
  {
    regex: '^Parent account with id (\\d+) not found$',
    ar: 'لم يتم العثور على الحساب الأب برقم {{1}}',
  },
  {
    regex: '^Account with id (\\d+) not found$',
    ar: 'لم يتم العثور على الحساب برقم {{1}}',
  },
  {
    regex: '^User with email (.+) already exists$',
    ar: 'المستخدم بالبريد الإلكتروني {{1}} موجود بالفعل',
  },
  {
    regex: '^User with username (.+) already exists$',
    ar: 'المستخدم باسم المستخدم {{1}} موجود بالفعل',
  },
  {
    regex: '^User with id (\\d+) does not exist$',
    ar: 'المستخدم برقم {{1}} غير موجود',
  },
  {
    regex: '^User with id (\\d+) not found$',
    ar: 'لم يتم العثور على المستخدم برقم {{1}}',
  },
  {
    regex: '^Driver with license number (.+) already exists$',
    ar: 'سائق برقم الرخصة {{1}} موجود بالفعل',
  },
  {
    regex: '^Contact with phone (.+) already exists$',
    ar: 'جهة اتصال برقم الهاتف {{1}} موجودة بالفعل',
  },
  {
    regex: '^Owner with phone number (.+) already exists$',
    ar: 'مالك برقم الهاتف {{1}} موجود بالفعل',
  },
  {
    regex: '^Owner with email (.+) already exists$',
    ar: 'مالك بالبريد {{1}} موجود بالفعل',
  },
  {
    regex: '^Owner with bank account number (.+) already exists$',
    ar: 'مالك برقم الحساب البنكي {{1}} موجود بالفعل',
  },
  {
    regex: '^Owner (\\d+) not found$',
    ar: 'لم يتم العثور على المالك برقم {{1}}',
  },
  {
    regex: '^Branch with name "(.+)" already exists$',
    ar: 'فرع بالاسم "{{1}}" موجود بالفعل',
  },
  {
    regex: '^Government with name (.+) already exists$',
    ar: 'محافظة بالاسم {{1}} موجودة بالفعل',
  },
  {
    regex: '^Warehouse item with name (.+) already exists$',
    ar: 'صنف مستودع بالاسم {{1}} موجود بالفعل',
  },
  {
    regex: '^Car with chassis number (.+) already exists$',
    ar: 'سيارة برقم الشاسيه {{1}} موجودة بالفعل',
  },
  {
    regex: '^Car with code (.+) already exists$',
    ar: 'سيارة بالكود {{1}} موجودة بالفعل',
  },
  {
    regex: '^Car with plate (.+) (.+) already exists$',
    ar: 'سيارة باللوحة {{1}} {{2}} موجودة بالفعل',
  },
  {
    regex: '^Trailer with code (.+) already exists$',
    ar: 'مقطورة بالكود {{1}} موجودة بالفعل',
  },
  {
    regex: '^Supplier with tax card (.+) already exists$',
    ar: 'مورد برقم البطاقة الضريبية {{1}} موجود بالفعل',
  },
  {
    regex: '^Supplier with commercial register (.+) already exists$',
    ar: 'مورد بالسجل التجاري {{1}} موجود بالفعل',
  },
  {
    regex: '^Supplier with tax registration number (.+) already exists$',
    ar: 'مورد برقم التسجيل الضريبي {{1}} موجود بالفعل',
  },
  {
    regex: '^Client with commercial record (.+) already exists$',
    ar: 'عميل بالسجل التجاري {{1}} موجود بالفعل',
  },
  {
    regex: '^Employee with id (\\d+) does not have an associated user$',
    ar: 'الموظف برقم {{1}} ليس له مستخدم مرتبط',
  },
  {
    regex: '^Journey with id (\\d+) already has a policy$',
    ar: 'الرحلة برقم {{1}} لديها بوليصة بالفعل',
  },
  {
    regex: '^Journey with id (\\d+) already has a transaction$',
    ar: 'الرحلة برقم {{1}} لديها قيد بالفعل',
  },
  {
    regex: '^Transaction with id (\\d+) not found for journey (\\d+)$',
    ar: 'لم يتم العثور على القيد {{1}} للرحلة {{2}}',
  },
  {
    regex: '^Cannot modify transaction with status (.+)$',
    ar: 'لا يمكن تعديل القيد بحالة {{1}}',
  },
  {
    regex: '^Unsupported vehicle mode: (.+)$',
    ar: 'وضع المركبة غير مدعوم: {{1}}',
  },
  {
    regex: '^Unsupported MIME type: (.+)$',
    ar: 'نوع MIME غير مدعوم: {{1}}',
  },
  {
    regex: '^Inline (.+?) creation is only allowed for NOLON_CAR \\(rental\\) mode$',
    ar: 'إنشاء {{1}} مضمّن مسموح فقط في وضع NOLON_CAR (تأجير)',
  },
  {
    regex: '^Only pending requests can be acted on \\(current status: (.+)\\)$',
    ar: 'يمكن التعامل مع الطلبات المعلقة فقط (الحالة الحالية: {{1}})',
  },
  {
    regex: '^Custody already exists for employee (\\d+) and account (\\d+)$',
    ar: 'العهدة موجودة مسبقاً للموظف {{1}} والحساب {{2}}',
  },
  {
    regex: '^(.+?) with id (\\d+) is not available \\(status: (.+)\\)$',
    ar: '{{entity1}} برقم {{2}} غير متاح (الحالة: {{3}})',
    entityGroups: [1],
  },
  {
    regex: '^(.+?) ownerShip must be (.+?) for (.+?) \\(got (.+?)\\)$',
    ar: 'ملكية {{entity1}} يجب أن تكون {{2}} لوضع {{3}} (الحالي: {{4}})',
    entityGroups: [1],
  },
  {
    regex: '^Driver account with name (.+?) (.+?) not found$',
    ar: 'لم يتم العثور على حساب السائق باسم {{1}} {{2}}',
  },
  {
    regex: '^Employee account with name (.+?) (.+?) not found$',
    ar: 'لم يتم العثور على حساب الموظف باسم {{1}} {{2}}',
  },
  {
    regex: '^Attachment for journey (\\d+) not found$',
    ar: 'لم يتم العثور على مرفق للرحلة {{1}}',
  },
  {
    regex: '^Delegation print record for journey (\\d+) not found$',
    ar: 'لم يتم العثور على سجل طباعة تفويض للرحلة {{1}}',
  },
  {
    regex: '^custody\\.amount is required when approving (.+)$',
    ar: 'مبلغ العهدة مطلوب عند الموافقة على {{1}}',
  },
  {
    regex: '^Invalid office request type: (.+)$',
    ar: 'نوع طلب المكتب غير صالح: {{1}}',
  },
  {
    regex: '^Parent account "(.+)" not found$',
    ar: 'لم يتم العثور على الحساب الأب "{{1}}"',
  },
  {
    regex: '^Employee (\\d+) does not have an associated user$',
    ar: 'الموظف برقم {{1}} ليس له مستخدم مرتبط',
  },
  {
    regex: '^Employee with id (\\d+) not found or has no user$',
    ar: 'لم يتم العثور على الموظف برقم {{1}} أو ليس له مستخدم',
  },
  {
    regex: '^Employee with user id (\\d+) not found$',
    ar: 'لم يتم العثور على الموظف للمستخدم برقم {{1}}',
  },
  {
    regex: '^Account with name (.+) not found$',
    ar: 'لم يتم العثور على الحساب باسم {{1}}',
  },
  ...validationPatterns,
  {
    regex: '^(.+?) with id (\\d+) not found$',
    ar: 'لم يتم العثور على {{entity1}} برقم {{2}}',
    entityGroups: [1],
  },
  {
    regex: '^(.+?) with id (\\d+) does not exist$',
    ar: '{{entity1}} برقم {{2}} غير موجود',
    entityGroups: [1],
  },
  {
    regex: '^(.+?) with (.+?) (.+?) already exists$',
    ar: '{{entity1}} بـ{{2}} {{3}} موجود بالفعل',
    entityGroups: [1],
  },
];

const output = { exact, entities, patterns };

const outPath = path.join(__dirname, '../src/i18n/locales/errors.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log('Wrote', outPath);
console.log('exact:', Object.keys(exact).length, 'patterns:', patterns.length);

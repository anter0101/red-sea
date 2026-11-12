import { AccountType, normalBalanceType } from 'src/app/modules/account/account.entity';

export interface AccountSeed {
  name: string;
  type: AccountType;
  normalBalance: normalBalanceType;
  isLeaf: boolean;
  parentName?: string;
  openingBalance?: number;
  systemKey?: string;
}

export const accounts: AccountSeed[] = [
  // ══════════════════════════════════════════════════════════════════════
  // TOP‑LEVEL ROOTS
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الأصول',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
  },
  {
    name: 'الخصوم',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
  },
  {
    name: 'حقوق الملكية',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
  },
  {
    name: 'الإيرادات',
    type: AccountType.REVENUE,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
  },
  {
    name: 'المصروفات',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
  },

  // ══════════════════════════════════════════════════════════════════════
  // NON-CURRENT ASSETS (under 'الأصول')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الاصول الغير متداوله ( اصول ثابته )',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الأصول',
  },
  {
    name: 'اصول ملموسه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الاصول الغير متداوله ( اصول ثابته )',
  },
  {
    name: 'تاسيس وتجهيز',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'الات ومعدات',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'سيارات',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'اجهزه كهربائيه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'اثاث',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'اجهزه كمبيوتر',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول ملموسه',
  },
  {
    name: 'استثمارات طويله الاجل',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الاصول الغير متداوله ( اصول ثابته )',
  },
  {
    name: 'اصول غير ملموسه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الاصول الغير متداوله ( اصول ثابته )',
  },
  {
    name: 'الشهره والسمه التجاريه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'اصول غير ملموسه',
  },

  // ══════════════════════════════════════════════════════════════════════
  // CURRENT ASSETS (under 'الأصول')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الاصول المتداوله',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الأصول',
  },
  {
    name: 'الخزينه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الاصول المتداوله',
  },
  {
    name: 'البنك',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الاصول المتداوله',
  },
  {
    name: 'المخزون',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الاصول المتداوله',
  },
  {
    name: 'عملاء',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الاصول المتداوله',
    systemKey: 'CLIENTS',
  },
  {
    name: 'ا.قبض',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الاصول المتداوله',
  },
  {
    name: 'العملاء تحت التنفيذ',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الاصول المتداوله',
    systemKey: 'CLIENTS_IN_PROGRESS',
  },
  {
    name: 'مدينين وارصده مدينه اخرى',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'الاصول المتداوله',
  },
  {
    name: 'عهد',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'مدينين وارصده مدينه اخرى',
    systemKey: 'CUSTODY',
  },
  {
    name: 'سلف',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'مدينين وارصده مدينه اخرى',
  },
  {
    name: 'ضرائب منبع',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'مدينين وارصده مدينه اخرى',
    systemKey: 'WITHHOLDING_TAX',
  },
  {
    name: 'تامينات لدى الغير',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'مدينين وارصده مدينه اخرى',
  },
  {
    name: 'موردين د.مقدمه',
    type: AccountType.ASSET,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'مدينين وارصده مدينه اخرى',
  },

  // ══════════════════════════════════════════════════════════════════════
  // NON-CURRENT LIABILITIES (under 'الخصوم')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الالتزامات الغير متداوله',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الخصوم',
  },
  {
    name: 'قروض',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'الالتزامات الغير متداوله',
  },
  {
    name: 'التزامات ضريبيه مؤجله',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'الالتزامات الغير متداوله',
  },

  // ══════════════════════════════════════════════════════════════════════
  // CURRENT LIABILITIES (under 'الخصوم')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الالتزامات المتداوله',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الخصوم',
  },
  {
    name: 'موردين',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'الالتزامات المتداوله',
  },
  {
    name: 'مورد النقل',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الالتزامات المتداوله',
    systemKey: 'TRANSPORT_SUPPLIER',
  },
  {
    name: 'مورد العهدة',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الالتزامات المتداوله',
    systemKey: 'CUSTODY_SUPPLIER',
  },
  {
    name: 'ا.دفع',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'الالتزامات المتداوله',
  },
  {
    name: 'دائنين وارصده دائنه اخرى',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الالتزامات المتداوله',
  },
  {
    name: 'رواتب',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },
  {
    name: 'ضريبه مرتبات',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },
  {
    name: 'ضريبه الخصم والاضافه',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },
  {
    name: 'ضريبة القيمة المضافة',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
    systemKey: 'VAT_PAYABLE',
  },
  {
    name: 'المساهمه التكافليه',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },
  {
    name: 'ضريبه الدخل',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },
  {
    name: 'تامينات للغير',
    type: AccountType.LIABILITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'دائنين وارصده دائنه اخرى',
  },

  // ══════════════════════════════════════════════════════════════════════
  // EQUITY (under 'حقوق الملكية')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'راس المال وحقوق الملكيه',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'حقوق الملكية',
  },
  {
    name: 'راس المال',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },
  {
    name: 'جارى الشركاء',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },
  {
    name: 'ارباح / خسائر مرحله',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },
  {
    name: 'ارباح / خسائر العام',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },
  {
    name: 'مجمع الاهلاك',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },
  {
    name: 'احتياطيات',
    type: AccountType.EQUITY,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'راس المال وحقوق الملكيه',
  },

  // ══════════════════════════════════════════════════════════════════════
  // REVENUE (under 'الإيرادات')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'الايرادات',
    type: AccountType.REVENUE,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الإيرادات',
  },
  {
    name: 'ايرادات تحت التنفيذ',
    type: AccountType.REVENUE,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الايرادات',
    systemKey: 'REVENUE_IN_PROGRESS',
  },
  {
    name: 'ايرادات تم تنفيذها',
    type: AccountType.REVENUE,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: false,
    parentName: 'الايرادات',
    systemKey: 'REVENUE_DONE',
  },
  {
    name: 'مردودات الايرادات',
    type: AccountType.REVENUE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'الإيرادات',
  },

  // ══════════════════════════════════════════════════════════════════════
  // EXPENSE CLASSIFICATIONS (under 'المصروفات')
  // ══════════════════════════════════════════════════════════════════════
  {
    name: 'تكلفة المبيعات',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'المصروفات',
  },
  {
    name: 'المصروفات التشغيلية',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'المصروفات',
  },
  {
    name: 'المصروفات التمويلية والضريبية',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: false,
    parentName: 'المصروفات',
  },

  // ── Cost of Goods Sold leaves ────────────────────────────────────────
  {
    name: 'مشتريات',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'تكلفة المبيعات',
  },
  {
    name: 'مردودات مشتريات',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.CREDIT,
    isLeaf: true,
    parentName: 'تكلفة المبيعات',
  },

  // ── Operating expenses leaves ────────────────────────────────────────
  {
    name: 'م.التشغيل',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التشغيلية',
  },
  {
    name: 'م.عموميه',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التشغيلية',
  },
  {
    name: 'م.اهلاك',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التشغيلية',
  },
  {
    name: 'سيارات عقود النولون',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التشغيلية',
    systemKey: 'NOLON_CONTRACT_CARS',
  },

  // ── Financing and tax leaves ─────────────────────────────────────────
  {
    name: 'م.تمويليه',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التمويلية والضريبية',
  },
  {
    name: 'م.ضريبه الدخل',
    type: AccountType.EXPENSE,
    normalBalance: normalBalanceType.DEBIT,
    isLeaf: true,
    parentName: 'المصروفات التمويلية والضريبية',
  },
];

import { ErrorTranslatorService } from './error-translator.service';

describe('ErrorTranslatorService', () => {
  let service: ErrorTranslatorService;

  beforeEach(() => {
    service = new ErrorTranslatorService();
    service.onModuleInit();
  });

  it('returns English when locale is en', () => {
    expect(service.translate('Duplicate contact phone numbers found', 'en')).toBe(
      'Duplicate contact phone numbers found',
    );
  });

  it('translates exact static messages to Arabic', () => {
    expect(service.translate('Duplicate contact phone numbers found', 'ar')).toBe(
      'تم العثور على أرقام هواتف مكررة في جهات الاتصال',
    );
  });

  it('translates dynamic not-found messages via patterns', () => {
    expect(service.translate('Driver with id 42 not found', 'ar')).toBe(
      'لم يتم العثور على السائق برقم 42',
    );
  });

  it('translates auth errors', () => {
    expect(service.translate('Invalid login email or password!', 'ar')).toBe(
      'البريد الإلكتروني أو كلمة المرور غير صحيحة!',
    );
  });

  it('defaults to Arabic when Accept-Language is missing', () => {
    expect(service.resolveLocale(undefined)).toBe('ar');
    expect(service.resolveLocale('')).toBe('ar');
  });

  it('resolves Arabic from Accept-Language', () => {
    expect(service.resolveLocale('ar-EG,ar;q=0.9')).toBe('ar');
    expect(service.resolveLocale('en-US')).toBe('en');
  });

  it('translates office request pending status error', () => {
    expect(
      service.translate('Only pending requests can be acted on (current status: APPROVED)', 'ar'),
    ).toBe('يمكن التعامل مع الطلبات المعلقة فقط (الحالة الحالية: APPROVED)');
  });

  it('translates office request custody approval errors', () => {
    expect(service.translate('Cannot approve custody request after invoice is issued', 'ar')).toBe(
      'لا يمكن الموافقة على طلب العهدة بعد إصدار الفاتورة',
    );
    expect(
      service.translate(
        'Cannot approve end-of-shift custody transfer before policy is collected',
        'ar',
      ),
    ).toBe('لا يمكن الموافقة على تحويل عهدة إنهاء الوردية قبل تحصيل البوليصة');
    expect(service.translate('Available balance is not enough', 'ar')).toBe(
      'الرصيد المتاح غير كافٍ',
    );
    expect(
      service.translate('custody.amount is required when approving ASK_FOR_CUSTODY', 'ar'),
    ).toBe('مبلغ العهدة مطلوب عند الموافقة على ASK_FOR_CUSTODY');
  });

  it('translates class-validator property constraint messages', () => {
    expect(service.translate('vehicleMode should not be empty', 'ar')).toBe(
      'vehicleMode يجب ألا يكون فارغاً',
    );
    expect(service.translate('clientId must be an integer number', 'ar')).toBe(
      'clientId يجب أن يكون عدداً صحيحاً',
    );
  });

  it('translates class-validator enum constraint messages', () => {
    expect(
      service.translate(
        'vehicleMode must be one of the following values: COMPANY_CAR, CONTRACT_CAR, NOLON_CAR',
        'ar',
      ),
    ).toBe('vehicleMode يجب أن يكون أحد القيم التالية: COMPANY_CAR, CONTRACT_CAR, NOLON_CAR');
  });

  it('translates journey delegation print validation errors', () => {
    expect(
      service.translate('Delegation for this journey is already marked as printed', 'ar'),
    ).toBe('تم وسم تفويض هذه الرحلة كمطبوع مسبقاً');
    expect(service.translate('Delegation print record for journey 5 not found', 'ar')).toBe(
      'لم يتم العثور على سجل طباعة تفويض للرحلة 5',
    );
  });

  it('translates warehouse stock movement errors', () => {
    expect(service.translate('IN quantity must be greater than 0', 'ar')).toBe(
      'كمية التوريد يجب أن تكون أكبر من صفر',
    );
    expect(service.translate('OUT quantity must be greater than 0', 'ar')).toBe(
      'كمية الصرف يجب أن تكون أكبر من صفر',
    );
    expect(service.translate('Insufficient stock: available 3, requested 10', 'ar')).toBe(
      'المخزون غير كافٍ: المتاح 3، المطلوب 10',
    );
  });

  it('translates warehouse not-found via entity pattern', () => {
    expect(service.translate('Warehouse with id 7 not found', 'ar')).toBe(
      'لم يتم العثور على المستودع برقم 7',
    );
  });

  it('translates date and number constraint suffixes', () => {
    expect(service.translate('purchaseDate must be a date string', 'ar')).toBe(
      'purchaseDate يجب أن يكون تاريخاً صالحاً',
    );
    expect(
      service.translate('unitPrice must be a number conforming to the specified constraints', 'ar'),
    ).toBe('unitPrice يجب أن يكون رقماً ضمن القيود المحددة');
  });
});

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from 'src/app/modules/area/area.entity'; // adjust path if needed
import { Government } from 'src/app/modules/government/government.entity'; // adjust path if needed

/**
 * Service dealing with area seeding operations.
 *
 * @class
 */
@Injectable()
export class AreaSeederService {
  /**
   * Create an instance of class.
   *
   * @constructs
   *
   * @param {Repository<Area>} areaRepository
   * @param {Repository<Government>} governmentRepository
   */
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Government)
    private readonly governmentRepository: Repository<Government>,
  ) {}

  /**
   * Seed all areas.
   *
   * @function
   */
  async create(): Promise<(Area | null)[]> {
    const areasData = [
      {
        governmentName: 'شمال سيناء',
        name: 'الحسنه وسط(الحمه -بغداد-المغاره-الريسان-مدينه الحسنه-عرب بلى-قريه)',
      },
      { governmentName: 'شمال سيناء', name: 'العريش' },
      {
        governmentName: 'شمال سيناء',
        name: 'رفح/الشيخ زويد/الحسنه شرق و غرب(جفجافه-القسيمه)',
      },
      { governmentName: 'شمال سيناء', name: 'بئر العبد' },
      { governmentName: 'شمال سيناء', name: 'نخل(شرق-وسط-غرب)' },
      {
        governmentName: 'شمال سيناء',
        name: 'الاسماعيليه الجديده/جامعه الاسماعيليه/سور المزارع السمكيه',
      },
      { governmentName: 'شمال سيناء', name: 'القنطره شرق' },
      {
        governmentName: 'شمال سيناء',
        name: 'بالوظه/جامعه شرق بورسعيد/شرق التفريعه/نفق الشهيد احمد حمدى شرق',
      },
      { governmentName: 'جنوب سيناء', name: 'راس سدر' },
      { governmentName: 'جنوب سيناء', name: 'راس مطاومه' },
      { governmentName: 'جنوب سيناء', name: 'راس بدران/ابو رديس/ابو زنيمه' },
      { governmentName: 'جنوب سيناء', name: 'الطور' },
      {
        governmentName: 'جنوب سيناء',
        name: 'سانت كاترين(وادى سعال)شرم الشيخ/وادى فيران/ط الرويسات',
      },
      { governmentName: 'جنوب سيناء', name: 'مطار شرم الشيخ' },
      { governmentName: 'جنوب سيناء', name: 'دهب(وادى الكيد)' },
      { governmentName: 'جنوب سيناء', name: 'نويبع / طابا' },

      // العاصمة الإدارية
      { governmentName: 'العاصمة الإدارية', name: 'العاصمة الإدارية' },

      // القاهرة
      { governmentName: 'القاهرة', name: 'القاهرة (1) المدن الجديدة' },
      { governmentName: 'القاهرة', name: 'القاهرة (2) مناطق حظر نقل' },
      { governmentName: 'القاهرة', name: 'القاهرة (3) مناطق حظر نقل تكدس مروري' },

      // الشرقية
      { governmentName: 'الشرقية', name: 'الشرقية (1)' },
      { governmentName: 'الشرقية', name: 'الشرقية (2)' },

      // الدقهلية
      { governmentName: 'الدقهلية', name: 'الدقهلية (1)' },
      { governmentName: 'الدقهلية', name: 'الدقهلية (2)' },

      // القليوبية
      { governmentName: 'القليوبية', name: 'القليوبية' },

      // الجيزة
      { governmentName: 'الجيزة', name: 'الجيزة (1) إقليمي أوسطي' },
      { governmentName: 'الجيزة', name: 'الجيزة (2) مناطق حظر نقل' },

      // المنوفية
      { governmentName: 'المنوفية', name: 'المنوفية' },
      { governmentName: 'المنوفية', name: 'السادات' },

      // الغربية
      { governmentName: 'الغربية', name: 'الغربية' },

      // مناطق خاصة
      { governmentName: 'القاهرة', name: 'صحراء محور دلتا مصر' },

      // الإسماعيلية
      { governmentName: 'الإسماعيلية', name: 'الإسماعيلية غرب القناة' },

      // السويس
      { governmentName: 'السويس', name: 'السويس' },
      { governmentName: 'السويس', name: 'العين السخنة' },

      // بورسعيد
      { governmentName: 'بورسعيد', name: 'بورسعيد' },
      { governmentName: 'بورسعيد', name: 'بورفؤاد' },

      // دمياط
      { governmentName: 'دمياط', name: 'دمياط' },

      // كفر الشيخ
      { governmentName: 'كفر الشيخ', name: 'كفر الشيخ' },

      // البحيرة
      { governmentName: 'البحيرة', name: 'البحيرة (1)' },
      { governmentName: 'البحيرة', name: 'البحيرة (2)' },
      { governmentName: 'البحيرة', name: 'البحيرة (3)' },

      // الإسكندرية
      { governmentName: 'الإسكندرية', name: 'الإسكندرية مركز 1' },

      // مطروح
      { governmentName: 'مطروح', name: 'العلمين' },
      { governmentName: 'مطروح', name: 'الضبعة' },
      { governmentName: 'مطروح', name: 'رأس الحكمة' },
      { governmentName: 'مطروح', name: 'مرسى مطروح' },
      { governmentName: 'مطروح', name: 'النجيلة' },
      { governmentName: 'مطروح', name: 'سيدي براني' },
      { governmentName: 'مطروح', name: 'السلوم' },
      { governmentName: 'مطروح', name: 'سيوة' },

      // الصعيد
      { governmentName: 'الفيوم', name: 'الفيوم' },
      { governmentName: 'بني سويف', name: 'بني سويف' },
      { governmentName: 'المنيا', name: 'المنيا' },
      { governmentName: 'أسيوط', name: 'أسيوط' },
      { governmentName: 'سوهاج', name: 'سوهاج' },
      { governmentName: 'قنا', name: 'قنا' },
      { governmentName: 'الأقصر', name: 'الأقصر' },
      { governmentName: 'الوادي الجديد', name: 'الوادي الجديد' },
      { governmentName: 'أسوان', name: 'أسوان' },

      // حلايب
      { governmentName: 'البحر الأحمر', name: 'حلايب' },

      // القاهرة
      { governmentName: 'القاهرة', name: 'مدينة نصر' },
      { governmentName: 'القاهرة', name: 'القطامية' },
      { governmentName: 'القاهرة', name: 'حلوان' },
      { governmentName: 'القاهرة', name: 'مدينة 15 مايو' },
      { governmentName: 'القاهرة', name: 'ماسبيرو' },
      { governmentName: 'القاهرة', name: 'مصر الجديدة' },
      { governmentName: 'القاهرة', name: 'التجمع' },
      { governmentName: 'القاهرة', name: 'الشروق/بدر' },
      { governmentName: 'القاهرة', name: 'الهايكستيب' },

      // الجيزة
      { governmentName: 'الجيزة', name: 'الوراق' },
      { governmentName: 'الجيزة', name: 'اكتوبر/الشيخ زايد' },
      { governmentName: 'الجيزة', name: 'الصف/اطفيح' },
      { governmentName: 'الجيزة', name: 'الواحات البحرية' },

      // العاصمة الإدارية
      { governmentName: 'العاصمة الإدارية', name: 'العاصمة الإدارية' },

      // القليوبية
      { governmentName: 'القليوبية', name: 'القليوبية' },

      // الشرقية
      { governmentName: 'الشرقية', name: 'الشرقية' },
      { governmentName: 'الشرقية', name: 'العاشر من رمضان' },

      // المنوفية
      { governmentName: 'المنوفية', name: 'المنوفية' },
      { governmentName: 'المنوفية', name: 'السادات' },

      // الغربية
      { governmentName: 'الغربية', name: 'الغربية' },

      // البحيرة
      { governmentName: 'البحيرة', name: 'البحيرة' },
      { governmentName: 'البحيرة', name: 'ادكو' },
      { governmentName: 'البحيرة', name: 'رشيد' },
      { governmentName: 'البحيرة', name: 'وادي النطرون' },
      { governmentName: 'البحيرة', name: 'النوبارية' },

      // الدقهلية
      { governmentName: 'الدقهلية', name: 'الدقهلية' },

      // كفر الشيخ
      { governmentName: 'كفر الشيخ', name: 'كفر الشيخ' },

      // دمياط (kept combined)
      { governmentName: 'دمياط', name: 'جمصة/دمياط/المنصورة الجديدة' },

      // الإسكندرية
      { governmentName: 'الإسكندرية', name: 'ابو قير' },
      { governmentName: 'الإسكندرية', name: 'الإسكندرية' },

      // مطروح
      { governmentName: 'مطروح', name: 'الساحل/العلمين' },
      { governmentName: 'مطروح', name: 'سيدي عبد الرحمن' },
      { governmentName: 'مطروح', name: 'فوكة/ط مطروح' },
      { governmentName: 'مطروح', name: 'محور الضبعة' },
      { governmentName: 'مطروح', name: 'الضبعة' },
      { governmentName: 'مطروح', name: 'سيدي براني' },
      { governmentName: 'مطروح', name: 'جربوب النجيله' },
      { governmentName: 'مطروح', name: 'السلوم' },
      { governmentName: 'مطروح', name: 'سيوة' },

      // الوادي الجديد
      { governmentName: 'الوادي الجديد', name: 'الواحات الخارجة' },
      { governmentName: 'الوادي الجديد', name: 'الواحات الداخلة' },
      { governmentName: 'الوادي الجديد', name: 'حباطة' },
      { governmentName: 'الوادي الجديد', name: 'بير النص' },
      { governmentName: 'الوادي الجديد', name: 'شرق العوينات' },

      // السويس
      { governmentName: 'السويس', name: 'العين السخنة' },
      { governmentName: 'السويس', name: 'السويس' },

      // البحر الأحمر
      { governmentName: 'البحر الأحمر', name: 'الزعفرانة' },
      { governmentName: 'البحر الأحمر', name: 'سفاجا' },
      { governmentName: 'البحر الأحمر', name: 'القصير' },
      { governmentName: 'البحر الأحمر', name: 'الغردقة' },
      { governmentName: 'البحر الأحمر', name: 'مرسى علم' },
      { governmentName: 'البحر الأحمر', name: 'برنيس' },
      { governmentName: 'البحر الأحمر', name: 'راس غارب' },
      { governmentName: 'البحر الأحمر', name: 'حلايب' },
      { governmentName: 'البحر الأحمر', name: 'شلاتين' },

      // الإسماعيلية
      { governmentName: 'الإسماعيلية', name: 'الإسماعيلية' },
      { governmentName: 'الإسماعيلية', name: 'الإسماعيلية الجديدة' },
      { governmentName: 'الإسماعيلية', name: 'بحر البقر' },
      { governmentName: 'الإسماعيلية', name: 'القنطرة شرق' },
      { governmentName: 'الإسماعيلية', name: 'شرق التفريعة' },

      // بورسعيد
      { governmentName: 'بورسعيد', name: 'بورسعيد' },

      // غير محدد
      { governmentName: 'غير محدد', name: 'حبل سحابة' },

      // بني سويف
      { governmentName: 'بني سويف', name: 'بني سويف' },

      // الفيوم
      { governmentName: 'الفيوم', name: 'الفيوم' },

      // المنيا
      { governmentName: 'المنيا', name: 'المنيا' },

      // أسيوط
      { governmentName: 'أسيوط', name: 'أسيوط' },

      // سوهاج
      { governmentName: 'سوهاج', name: 'سوهاج' },

      // قنا
      { governmentName: 'قنا', name: 'قنا' },

      // الأقصر
      { governmentName: 'الأقصر', name: 'الأقصر' },

      // أسوان
      { governmentName: 'أسوان', name: 'أسوان' },
      { governmentName: 'أسوان', name: 'توشكى' },

      // جنوب سيناء
      { governmentName: 'جنوب سيناء', name: 'رأس سدر' },
      { governmentName: 'جنوب سيناء', name: 'مطار المليز' },
    ];

    const createdAreas: (Area | null)[] = [];
    for (const areaData of areasData) {
      let gov = await this.governmentRepository.findOne({
        where: { name: areaData.governmentName },
      });

      // If government does not exist, create it first
      if (!gov) {
        const newGovernment = this.governmentRepository.create({
          name: areaData.governmentName,
        });
        gov = await this.governmentRepository.save(newGovernment);
      }

      const existingArea = await this.areaRepository.findOne({
        where: { name: areaData.name, government: { id: gov.id } },
      });
      if (existingArea) {
        createdAreas.push(null);
      } else {
        const newArea = this.areaRepository.create({
          name: areaData.name,
          government: gov,
        });
        const savedArea = await this.areaRepository.save(newArea);
        createdAreas.push(savedArea);
      }
    }
    return createdAreas;
  }
}

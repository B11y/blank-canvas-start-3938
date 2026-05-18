## Plan: تحديث اللوجو واللينكات

### 1. إضافة اللوجو
- نسخ `Untitled-1_copy-03-01.svg` إلى `src/assets/logo.svg`
- في `src/components/layout/Header.tsx`: استبدال النص `{photographerInfo.name.toUpperCase()}` بصورة اللوجو (`<img>` بارتفاع ~40px، مع `alt` للاسم)
- في الوضع الشفاف (هيرو) ممكن نضيف فلتر `brightness-0 invert` لو اللوجو ملون عشان يبقى واضح فوق الصورة، أو نسيبه زي ما هو حسب ألوان اللوجو

### 2. تحديث السوشيال ميديا
في `src/data/photographer.ts` (وتعديل النوع لو لزم):
- `instagram`: https://www.instagram.com/imde.signstudio/
- `linkedin`: https://www.linkedin.com/in/ibrahim-mohamed-8a19981b1
- `behance`: https://www.behance.net/ibrahimmohamed196
- `facebook` (جديد): https://www.facebook.com/share/1DYCNVSTDJ/
- `whatsapp` (جديد): https://wa.me/201000135225
- `email`: im60691@gmail.com

### 3. إضافة أيقونات Facebook و WhatsApp
- في `Footer.tsx` و `About.tsx`: إضافة لينكات Facebook (أيقونة `Facebook` من lucide-react) و WhatsApp (أيقونة `MessageCircle` أو SVG واتساب مخصص)

### 4. تحديث صفحة Contact
- تحديث رقم التليفون والإيميل في `photographerInfo` (phone = +201000135225)

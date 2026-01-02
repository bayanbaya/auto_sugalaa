# Суулгах заавар

## Шинэчлэгдсэн зүйлс

### 1. Database-ийн шинэчлэлт (АНХААРУУЛГА: ЗААВАЛ уншина уу!)

ID талбарыг AUTO_INCREMENT болгохын тулд дараах командуудыг ажиллуулна уу:

#### Арга 1: Өгөгдлөө хадгалах (ID нь тоо байх ёстой)

```bash
# MySQL руу нэвтрэх
mysql -h 103.153.141.146 -u prod_test -p'StrongPass2024' -D autosugalaa

# Дараах SQL-г ажиллуулах
```

```sql
-- ID-г INT болгоод AUTO_INCREMENT нэмэх
ALTER TABLE lotteryName MODIFY id INT NOT NULL;
ALTER TABLE lotteryName MODIFY id INT AUTO_INCREMENT;

-- Одоогийн AUTO_INCREMENT утгыг тохируулах
SET @max_id = (SELECT IFNULL(MAX(id), 0) + 1 FROM lotteryName);
SET @alter_sql = CONCAT('ALTER TABLE lotteryName AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

#### Арга 2: Өгөгдлийг бүхэлд нь устгаад шинээр эхлэх

```sql
-- АНХААРУУЛГА: Энэ нь БҮХ ӨГӨГДЛИЙГ УСТГАНА!
DROP TABLE IF EXISTS lotteryName;

CREATE TABLE lotteryName (
  id INT AUTO_INCREMENT PRIMARY KEY,
  img VARCHAR(255) DEFAULT NULL,
  iban VARCHAR(50) NOT NULL,
  ibanName VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  fbLink VARCHAR(255) DEFAULT NULL,
  carName VARCHAR(200) NOT NULL,
  total INT NOT NULL,
  sold INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Код дээрх өөрчлөлтүүд

#### Нэмэгдсэн файлууд:
- `src/lib/uploadImage.ts` - Зураг хадгалах utility функц
- `database-update.sql` - Database шинэчлэх скрипт

#### Өөрчлөгдсөн файлууд:
- `src/app/api/cars/add/route.ts`:
  - ID шаардлагагүй болсон (AUTO_INCREMENT)
  - Зураг үнэхээр file system дээр хадгалагдах болсон

- `src/app/admin/add-car/page.tsx`:
  - ID талбар устсан (хэрэггүй)
  - Frontend validation шинэчлэгдсэн

### 3. Яаж ажиллах вэ?

1. **Машин нэмэх**: `/admin/add-car` дээр ID оруулах шаардлагагүй
2. **Зураг**: Base64 зургийг сонгосон үед автоматаар `public/lotteryCars/{id}.jpg` руу хадгалагдана
3. **ID**: Database автоматаар нэмэгдэх ID үүсгэнэ (1, 2, 3, ...)

### 4. Ажиллаж эхлүүлэх

```bash
# Dependencies суулгах (шаардлагатай бол)
npm install

# Dev server ажиллуулах
npm run dev

# Production build
npm run build
npm start
```

## Шинэ функцууд

### ✅ AUTO_INCREMENT ID
- Гараар ID бичих шаардлагагүй
- Database автоматаар unique ID үүсгэнэ

### ✅ Зураг хадгалах
- Base64 зургийг file system дээр хадгална
- Format: `/lotteryCars/{id}.jpg` эсвэл `.png`
- Зам: `public/lotteryCars/` folder

### ✅ Image Utility Functions
```typescript
// Зураг хадгалах
await saveBase64Image(base64String, carId);

// Зураг устгах
deleteImage('/lotteryCars/1.jpg');
```

## Асуудал гарвал

1. **Зураг харагдахгүй байна**: `public/lotteryCars/` folder байгаа эсэхийг шалгана уу
2. **ID алдаа**: Database-ийн AUTO_INCREMENT тохируулсан эсэхийг шалгана уу
3. **Permission алдаа**: `public/lotteryCars/` folder дээр write эрх байгаа эсэхийг шалгана уу

```bash
# Linux/Mac дээр
chmod -R 755 public/lotteryCars

# Folder үүсгэх
mkdir -p public/lotteryCars
```

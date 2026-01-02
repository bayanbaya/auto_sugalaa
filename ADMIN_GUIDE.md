# Машин удирдах систем - Админ заавар

## 🎯 Хэрхэн ашиглах

### 1. Админ хэсэгт нэвтрэх
```
http://localhost:3000/admin
```

### 2. "Машин нэмэх" товч дарна
Шар өнгийн header дээрх ногоон "Машин нэмэх" товч дарна.

---

## ✨ Шинэ функцууд

### 🔄 Төлөв өөрчлөх (Active/Inactive)
Машин бүр дээр **Идэвхтэй/Идэвхгүй** товч байдаг. Энэ нь:
- ✅ **Идэвхтэй**: Хэрэглэгчид вэбсайт дээр харна
- ❌ **Идэвхгүй**: Зөвхөн админд харагдана, хэрэглэгчид нуугдана

**Хэрхэн ашиглах:**
1. Машины карт дээрх төлөвийн товчийг дарна
2. Автоматаар өөрчлөгдөнө (идэвхтэй ↔ идэвхгүй)
3. Refresh хийх шаардлагагүй

### 🖼️ Зургийн хадгалалт
- ⚠️ **Base64 зураг**: `/lotteryCars/{id}.jpg` гэсэн замд placeholder хадгалагдана
- 💡 **Зөвлөмж**: Production дээр AWS S3, Cloudinary ашигла
- ✅ **Database алдаа засагдсан**: "Data too long" алдаа гарахгүй болсон

### 3. Мэдээлэл оруулах

#### Шаардлагатай талбарууд:
- **Машины ID**: Давтагдашгүй ID (жишээ: `lexus-600`, `bmw-x5`)
  - Зөвхөн үсэг, тоо, `_` болон `-` тэмдэгт

- **Машины нэр**: Машины бүтэн нэр (жишээ: `LEXUS 600`)

- **Дансны дугаар**: Банкны дансны дугаар (жишээ: `5168040333`)
  - Зөвхөн тоо

- **Эзэмшигчийн нэр**: Дансны эзэмшигч (жишээ: `Б.Өлзийням`)

- **Үнэ**: Тасалбарын үнэ (жишээ: `50,000`)
  - Таслалыг автоматаар нэмнэ
  - ₮ тэмдэг нэмэх шаардлагагүй

- **Нийт сугалааны тоо**: Сугалаанд оролцох нийт тоо (жишээ: `9899`)

#### Нэмэлт талбарууд:
- **Машины зураг**: Зураг байршуулах (макс 5MB)
  - JPG, PNG, WebP формат
  - Зөвлөмж: 800x600px эсвэл дээш

- **Facebook холбоос**: Сугалааны пост холбоос
  - `http://` эсвэл `https://` ээр эхлэнэ

- **Төлөв**: Машины харагдах эсэх
  - **Идэвхтэй**: Вэбсайт дээр харагдана (default)
  - **Идэвхгүй**: Зөвхөн админд харагдана

### 4. Хадгалах
"Машин нэмэх" товч дарж мэдээллийг хадгална.

Амжилттай бол автоматаар админ жагсаалт руу буцна.

## 📊 Database Schema

```sql
CREATE TABLE lotteryName (
  id VARCHAR(255) PRIMARY KEY,
  img TEXT,
  iban VARCHAR(50) NOT NULL,
  ibanName VARCHAR(255) NOT NULL,
  price VARCHAR(50) NOT NULL,
  fbLink TEXT,
  carName VARCHAR(255) NOT NULL,
  total INT NOT NULL,
  sold INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active'  -- 'active' or 'inactive'
);
```

## 🔧 API Endpoints

### POST /api/cars/add

**Request Body:**
```json
{
  "id": "lexus-600",
  "img": "data:image/jpeg;base64,/9j/4AAQ..." or "/path/to/image.jpg",
  "iban": "5168040333",
  "ibanName": "Б.Өлзийням",
  "price": "50000",
  "fbLink": "https://www.facebook.com/share/p/1D5cdtnpWE/",
  "carName": "LEXUS 600",
  "total": 9899,
  "sold": 0,
  "status": "active"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Машин амжилттай нэмэгдлээ",
  "car": { ... }
}
```

**Response (Error - 400/409/500):**
```json
{
  "error": "Алдааны мэдээлэл",
  "details": "Дэлгэрэнгүй мэдээлэл"
}
```

---

### PATCH /api/cars/update-status

**Description**: Машины төлөвийг өөрчлөх (active ↔ inactive)

**Request Body:**
```json
{
  "id": "lexus-600",
  "status": "inactive"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "\"LEXUS 600\" машины төлөв \"идэвхгүй\" болж өөрчлөгдлөө",
  "car": {
    "id": "lexus-600",
    "carName": "LEXUS 600",
    "status": "inactive"
  }
}
```

**Response (Error - 400/404/500):**
```json
{
  "error": "Төлөв өөрчлөхөд алдаа гарлаа",
  "details": "Дэлгэрэнгүй мэдээлэл"
}
```

## ✅ Validation Rules

1. **ID**: Давтагдашгүй, зөвхөн үсэг/тоо/_/-
2. **IBAN**: Зөвхөн тоо
3. **Price**: Зөвхөн тоо (таслал, ₮ автоматаар боловсруулна)
4. **Total**: Эерэг бүхэл тоо
5. **Image**: Base64 → `/lotteryCars/{id}.jpg` placeholder хадгалагдана
6. **Facebook Link**: http/https ээр эхлэнэ
7. **Status**: "active" эсвэл "inactive" (default: "active")

## 🎨 Features

### Frontend Features:
- ✅ Real-time form validation
- ✅ Auto-formatting for price (add commas)
- ✅ Image preview before upload
- ✅ Image size/type validation
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading states with animations
- ✅ Success/Error notifications with auto-dismiss
- ✅ Field-level error messages
- ✅ Professional glassmorphism design
- ✅ **Status toggle** (active/inactive) with visual feedback
- ✅ **One-click status change** - no page refresh needed

### Backend Features:
- ✅ MySQL connection pooling
- ✅ Input sanitization & validation
- ✅ Duplicate ID prevention (409 Conflict)
- ✅ SQL injection protection
- ✅ Proper error handling with rollback
- ✅ Type-safe TypeScript implementation
- ✅ **Image storage optimization** - prevents "Data too long" errors
- ✅ **Status management API** - PATCH endpoint for status updates

## 🚀 Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5
- **Database**: MySQL
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Architecture**: RESTful API

## 📝 Example SQL Operations

### Insert New Car
```sql
INSERT INTO lotteryName
  (id, img, iban, ibanName, price, fbLink, carName, total, sold, status)
VALUES
  ('lexus-600', '/lotteryCars/lexus-600.jpg', '5168040333',
   'Б.Өлзийням', '50000', 'https://www.facebook.com/share/p/1D5cdtnpWE/',
   'LEXUS 600', 9899, 0, 'active');
```

### Update Car Status
```sql
UPDATE lotteryName
SET status = 'inactive'
WHERE id = 'lexus-600';
```

### Get Active Cars Only (for public website)
```sql
SELECT * FROM lotteryName
WHERE status = 'active'
ORDER BY id DESC;
```

### Get All Cars (for admin)
```sql
SELECT * FROM lotteryName
ORDER BY id DESC;
```

## 🛡️ Security

- SQL Injection protection (Parameterized queries)
- Input validation & sanitization
- File type & size validation
- Connection pooling with limits
- Error handling without sensitive data exposure

## 📱 Responsive Design

- Mobile: Optimized layout
- Tablet: 2-column grid
- Desktop: Full feature layout
- Touch-friendly buttons
- Accessible form controls

---

Made with ❤️ for World-Class Lottery System

# 📞 Утасны дугаар задлах заавар

## 🎯 Ерөнхий тайлбар

Банкны гүйлгээний утга (`guildgeeniiUtga`) дээрээс утасны дугаарыг задалж авдаг.

---

## 🔍 Regex Pattern

### TypeScript Implementation

```typescript
/\b(?:\+976\s?|0\s?)?([1-9]\d(?:\s?\d){6})\b/
```

### Ruby Implementation (equivalent)

```ruby
/\b(?:\+976\s?|0)?([1-9]\d(?:\s?\d){6})\b/
```

---

## 📝 Pattern тайлбар

| Хэсэг | Тайлбар |
|-------|---------|
| `\b` | Word boundary (утасны дугаар эхлэх) |
| `(?:\+976\s?\|0\s?)?` | Optional: "+976" эсвэл "0" prefix (space-тэй эсвэл үгүй) |
| `([1-9]\d(?:\s?\d){6})` | **Capture group**: 8 оронтой дугаар |
| `[1-9]` | Эхний орон: 1-9 (0 биш!) |
| `\d` | Хоёр дахь орон: аливаа тоо |
| `(?:\s?\d){6}` | Үлдсэн 6 орон (space-тэй эсвэл үгүй) |
| `\b` | Word boundary (дуусах) |

---

## ✅ Зөв форматууд

### 1. Энгийн формат

```
Input:  "99189602"
Output: "99189602"
```

### 2. Space-тэй

```
Input:  "99 18 96 02"
Output: "99189602"

Input:  "9 9 1 8 9 6 0 2"
Output: "99189602"
```

### 3. Олон утастай (эхнийг авна)

```
Input:  "99189602 95518283"
Output: "99189602"
```

### 4. Текстийн дунд

```
Input:  "MM:99189602 95518283 (ХААН БАНК)"
Output: "99189602"

Input:  "ХААНААС: 520000 АРИУНТУУЛ 99189602"
Output: "99189602"
```

### 5. +976 prefix-тэй

```
Input:  "+976 99189602"
Output: "99189602"

Input:  "+97699189602"
Output: "99189602"
```

### 6. 0 prefix-тэй

```
Input:  "0 99189602"
Output: "99189602"

Input:  "099189602"
Output: "99189602"
```

---

## ❌ Буруу форматууд (null буцаана)

### 1. Хэтэрхий богино

```
Input:  "12345"
Output: null
```

### 2. 0-ээр эхэлсэн

```
Input:  "01234567"
Output: null

Шалтгаан: Монголын утас 0-ээр эхлэхгүй
```

### 3. Утасны дугаар байхгүй

```
Input:  "ХААН БАНК"
Output: null

Input:  "Гүйлгээ"
Output: null
```

### 4. Хоосон эсвэл null

```
Input:  ""
Output: null

Input:  null
Output: null
```

---

## 🧪 Test жишээнүүд

### Таны гүйлгээний жишээ

```
Input: "MM:99189602 95518283  (ХААН БАНК КАКЕН НУРБЕК) ХААНААС: 520000 АРИУНТУУЛ ДАМБАСАНЖАА"
Output: "99189602" ✅
```

### Өөр жишээнүүд

```typescript
extractPhoneNumber("99189602") → "99189602"
extractPhoneNumber("MM:99189602 95518283") → "99189602"
extractPhoneNumber("+976 99189602") → "99189602"
extractPhoneNumber("0 99 18 96 02") → "99189602"
extractPhoneNumber("ХААН БАНК") → null
extractPhoneNumber("01234567") → null
```

---

## 💻 Code жишээ

### TypeScript

```typescript
import { extractPhoneNumber } from '@/lib/lotteryCalculator';

const description = "MM:99189602 95518283 (ХААН БАНК)";
const phone = extractPhoneNumber(description);

if (phone) {
  console.log(`Phone: ${phone}`); // "99189602"
} else {
  console.log('No phone found');
}
```

### SQL Query

```sql
SELECT
  id,
  guildgeeniiUtga,
  -- Phone extracted and saved
  phoneNumber
FROM mblottery
WHERE phoneNumber IS NOT NULL;
```

---

## 🔧 Database Schema

### mblottery table

```sql
CREATE TABLE mblottery (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lotteryNumber VARCHAR(50),
  createdAt DATETIME,
  bankTransactionId BIGINT,
  carId VARCHAR(50),
  transactionAmount INT,
  phoneNumber VARCHAR(50) NULL  -- ✅ 8 digits эсвэл null
);
```

**Important:**
- `phoneNumber` нь `VARCHAR(50)` (8 digits-тэй багтаж чадна)
- `NULL` утга зөвшөөрөгдсөн (утасны дугаар олдоогүй бол)

---

## 🐛 Troubleshooting

### Асуудал 1: "Data too long for column 'phoneNumber'"

**Шалтгаан:** Бүтэн текст хадгалагдаж байна.

**Шийдэл:**
```typescript
// ❌ Буруу
phoneNumber: row.guildgeeniiUtga

// ✅ Зөв
phoneNumber: extractPhoneNumber(row.guildgeeniiUtga)
```

---

### Асуудал 2: Утасны дугаар олдохгүй байна

**Шалгах:**
1. Гүйлгээний утга зөв эсэх
2. Утасны формат: 8 орон, 1-9-ээр эхэлнэ
3. Regex pattern зөв эсэх

```typescript
const text = "MM:99189602 ...";
console.log(extractPhoneNumber(text)); // "99189602"
```

---

### Асуудал 3: Олон утас байвал аль нь хадгалагдах вэ?

**Хариулт:** **Эхний утас** хадгалагдана.

```
"99189602 95518283" → "99189602"
```

Хэрэв хоёр дахь утасыг авахыг хүсвэл regex-ийг өөрчлөх хэрэгтэй.

---

## 📊 Statistics

### Утасны дугаар бүхий гүйлгээ

```sql
SELECT
  COUNT(*) AS total_lotteries,
  COUNT(phoneNumber) AS with_phone,
  COUNT(*) - COUNT(phoneNumber) AS without_phone
FROM mblottery
WHERE carId = 2;
```

**Жишээ үр дүн:**
```
total_lotteries: 150
with_phone:      120
without_phone:   30
```

---

## 🎉 Best Practices

1. **Үргэлж `extractPhoneNumber()` ашиглах**
   ```typescript
   const phone = extractPhoneNumber(description);
   ```

2. **NULL шалгах**
   ```typescript
   if (phone) {
     // SMS илгээх, notification өгөх гэх мэт
   }
   ```

3. **Logging**
   ```typescript
   if (!phone) {
     console.warn(`No phone found in: ${description}`);
   }
   ```

4. **Unit test бичих**
   ```typescript
   expect(extractPhoneNumber("99189602")).toBe("99189602");
   expect(extractPhoneNumber("БАНК")).toBeNull();
   ```

---

**Амжилт хүсье! 📞✨**

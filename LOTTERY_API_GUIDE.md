# Сугалаа үүсгэх API - Заавар

## 🎯 Ерөнхий тайлбар

Энэхүү API нь **bankTransactions** table-аас өгөгдөл авч, **mblottery** table руу сугалаа үүсгэдэг.

## 📊 Ажиллах зарчим

### 1. Сугалааны тоо тооцоолох

```typescript
// QPAY 1% шимтгэл + 2% tolerance
grossAmount = floor(netAmount / 0.98)

// Сугалааны тоо
ticketCount = floor(grossAmount / ticketPrice)

// Maximum хязгаарлалт
if (ticketCount > 5000) ticketCount = 5000
```

**Жишээ:**
- Гүйлгээний дүн: 49,000₮
- Нэг сугалааны үнэ: 20,000₮
- Gross amount: `floor(49,000 / 0.98)` = 50,000₮
- Ticket count: `floor(50,000 / 20,000)` = **2 сугалаа**

### 2. Давхардсан гүйлгээ шалгах

API автоматаар давхардсан гүйлгээг алгасдаг:

```sql
SELECT * FROM bankTransactions bt
WHERE bt.carId = ?
AND NOT EXISTS (
  SELECT 1 FROM mblottery ml
  WHERE ml.bankTransactionId = bt.id
)
```

Нэг гүйлгээнд хэд ч удаа API дуудсан ч **ганц удаа** сугалаа үүснэ.

### 3. Утасны дугаар задлах

```typescript
extractPhoneNumber("98123456 Батбаяр") → "98123456"
extractPhoneNumber("Захиалга 99887766") → "99887766"
extractPhoneNumber("Гүйлгээ") → null
```

## 🚀 API Endpoints

### POST /api/lottery/generate

**Сугалаа үүсгэх**

#### Request Body:

```json
{
  "carId": 2,
  "ticketPrice": 20000,
  "processAll": false
}
```

**Parameters:**
- `carId` (required): Машины ID
- `ticketPrice` (required): Нэг сугалааны үнэ (₮)
- `processAll` (optional):
  - `false` (default): Зөвхөн шинэ гүйлгээ боловсруулах
  - `true`: Бүх гүйлгээг дахин боловсруулах

#### Response (Success):

```json
{
  "success": true,
  "message": "150 сугалаа амжилттай үүсгэлээ",
  "statistics": {
    "processedTransactions": 50,
    "generatedLotteries": 150,
    "skippedTransactions": 5
  },
  "processedTransactionIds": [1, 2, 3, ...]
}
```

#### Response (No new data):

```json
{
  "success": true,
  "message": "Боловсруулах шинэ гүйлгээ олдсонгүй",
  "statistics": {
    "processedTransactions": 0,
    "generatedLotteries": 0,
    "skippedTransactions": 0
  }
}
```

#### Response (Error):

```json
{
  "error": "Сугалаа үүсгэхэд алдаа гарлаа",
  "details": "Connection timeout"
}
```

### GET /api/lottery/generate?carId=2

**Статистик харах**

#### Response:

```json
{
  "success": true,
  "carId": 2,
  "statistics": {
    "totalTransactions": 100,
    "totalLotteries": 250,
    "unprocessedTransactions": 10
  }
}
```

## 💻 Жишээ код (Frontend)

### 1. Сугалаа үүсгэх товч

```typescript
async function generateLotteries(carId: number, ticketPrice: number) {
  const response = await fetch('/api/lottery/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carId,
      ticketPrice,
      processAll: false, // Зөвхөн шинэ гүйлгээ
    }),
  });

  const result = await response.json();

  if (result.success) {
    alert(`✅ ${result.statistics.generatedLotteries} сугалаа үүслээ`);
  } else {
    alert(`❌ Алдаа: ${result.error}`);
  }
}
```

### 2. Статистик харах

```typescript
async function fetchLotteryStats(carId: number) {
  const response = await fetch(`/api/lottery/generate?carId=${carId}`);
  const result = await response.json();

  console.log('Нийт гүйлгээ:', result.statistics.totalTransactions);
  console.log('Нийт сугалаа:', result.statistics.totalLotteries);
  console.log('Боловсруулаагүй:', result.statistics.unprocessedTransactions);
}
```

## 🗄️ Database өөрчлөлтүүд

### lotteryName table

```sql
UPDATE lotteryName
SET sold = (
  SELECT COUNT(*) FROM mblottery WHERE carId = ?
)
WHERE id = ?
```

Сугалаа үүсгэх үед `sold` талбар автоматаар шинэчлэгдэнэ.

## 🔒 Аюулгүй байдал

### Transaction хамгаалалт

```typescript
await connection.beginTransaction();
try {
  // ... insert lotteries
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
}
```

### SQL Injection хамгаалалт

Бүх query prepared statement ашигладаг:

```typescript
await connection.execute(
  'INSERT INTO mblottery (lotteryNumber, ...) VALUES (?, ...)',
  [lotteryNumber, ...]
);
```

## 📝 Нэмэлт мэдээлэл

### Сугалааны дугаар формат

```
{carId}-{timestamp}-{index}-{random}
```

**Жишээ:**
```
2-1704123456789-0-A1B2C
2-1704123456789-1-D3E4F
```

### Capacity хязгаарлалт

- **Max tickets per transaction**: 5000
- **Ticket price range**: > 0₮
- **Phone number format**: 8 орон (88123456, 99123456)

## 🧪 Туршилт

### Test Case 1: Жирийн гүйлгээ

```json
{
  "carId": 2,
  "ticketPrice": 20000
}
```

**Input:** 50,000₮ гүйлгээ
**Expected:** 2 сугалаа үүснэ

### Test Case 2: Хамгийн бага үнэ

```json
{
  "carId": 2,
  "ticketPrice": 20000
}
```

**Input:** 10,000₮ гүйлгээ
**Expected:** 0 сугалаа (алгасагдана)

### Test Case 3: Давхардсан гүйлгээ

**1-р удаа API дуудах:**
```json
{"carId": 2, "ticketPrice": 20000}
```
→ 100 сугалаа үүснэ

**2-р удаа API дуудах:**
```json
{"carId": 2, "ticketPrice": 20000}
```
→ 0 сугалаа (давхардсан учраас)

## 🛠️ Troubleshooting

### Асуудал 1: Сугалаа үүсэхгүй байна

**Шийдэл:**
1. `ticketPrice` зөв эсэхийг шалгах
2. Database-д `bankTransactions` байгаа эсэхийг шалгах
3. `carId` зөв эсэхийг баталгаажуулах

```sql
SELECT * FROM bankTransactions WHERE carId = 2;
```

### Асуудал 2: Давхардсан сугалаа үүсч байна

**Шийдэл:**
```sql
-- Давхардсан сугалаа устгах
DELETE FROM mblottery
WHERE id NOT IN (
  SELECT MIN(id)
  FROM mblottery
  GROUP BY bankTransactionId
);
```

### Асуудал 3: `sold` count буруу байна

**Шийдэл:**
```sql
-- Manually update sold count
UPDATE lotteryName
SET sold = (
  SELECT COUNT(*) FROM mblottery WHERE carId = lotteryName.id
);
```

## 📞 Support

Асуудал гарвал:
1. Browser console шалгах
2. Server logs шалгах (`console.error` харах)
3. Database connection шалгах

---

**Баяртай coding! 🚗✨**

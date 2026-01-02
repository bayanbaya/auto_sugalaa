-- 1. ID талбарыг AUTO_INCREMENT болгох
-- Анхааруулга: Өмнөх өгөгдлүүд устана!

-- Option A: Хуучин table-г устгаад шинээр үүсгэх (АНХААРУУЛГА: бүх өгөгдөл устана)
/*
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
*/

-- Option B: Өгөгдлөө хадгалах бол (ID-г тоо руу хөрвүүлэх)
-- Эхлээд ID нь тоо биш байвал энэ алдаа гарна
ALTER TABLE lotteryName MODIFY id INT NOT NULL;
ALTER TABLE lotteryName MODIFY id INT AUTO_INCREMENT;

-- Одоогийн AUTO_INCREMENT утгыг тохируулах
-- Хамгийн том ID + 1 байх ёстой
SET @max_id = (SELECT IFNULL(MAX(id), 0) + 1 FROM lotteryName);
SET @alter_sql = CONCAT('ALTER TABLE lotteryName AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

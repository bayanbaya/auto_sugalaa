-- Database үүсгэх
CREATE DATABASE IF NOT EXISTS lottery_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lottery_db;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  -- Primary key
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Ажилтны мэдээлэл
  employee_name VARCHAR(100) NOT NULL COMMENT 'Ажилтны нэр',
  
  -- Гүйлгээний мэдээлэл
  transaction_date DATETIME NOT NULL COMMENT 'Гүйлгээний огноо',
  branch VARCHAR(50) NOT NULL COMMENT 'Салбарын код',
  amount DECIMAL(15, 2) NOT NULL COMMENT 'Гүйлгээний дүн',
  description TEXT COMMENT 'Гүйлгээний утга',
  account_number VARCHAR(50) COMMENT 'Харьцсан дансны дугаар',
  
  -- Үлдэгдэл
  start_balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Эхний үлдэгдэл',
  end_balance DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Эцсийн үлдэгдэл',
  
  -- Import мэдээлэл
  file_name VARCHAR(255) COMMENT 'Excel файлын нэр',
  import_date DATETIME NOT NULL COMMENT 'Импорт хийсэн огноо',
  excel_row_number INT COMMENT 'Excel мөрийн дугаар',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Үүсгэсэн огноо',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Шинэчилсэн огноо',
  
  -- Indexes - хурдан хайлт
  INDEX idx_employee_date (employee_name, transaction_date DESC),
  INDEX idx_date (transaction_date DESC),
  INDEX idx_branch (branch),
  INDEX idx_employee (employee_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Сугалааны гүйлгээний бүртгэл';
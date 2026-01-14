# เพิ่ม Swagger UI แบบ Auto Generate

## 📋 สารบัญ
1. [ติดตั้ง Package](#ติดตั้ง-package)
2. [สร้างไฟล์ Swagger Config](#สร้างไฟล์-swagger-config)
3. [แก้ไขไฟล์ในโปรเจค](#แก้ไขไฟล์ในโปรเจค)
4. [คำสั่งรันและทดสอบ](#คำสั่งรันและทดสอบ)
5. [ทดสอบ Swagger UI](#ทดสอบ-swagger-ui)

---

## ติดตั้ง Package

```bash
npm install swagger-ui-express
npm install swagger-autogen --save-dev
```

---

## สร้างไฟล์ Swagger Config

สร้างไฟล์ `swagger.js` ที่ root โปรเจค (นอก folder src):

```javascript
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Member API',
    description: 'API สำหรับจัดการสมาชิก'
  },
  host: 'localhost:4000',
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const routes = ['./src/index.js'];

swaggerAutogen(outputFile, routes, doc);
```

**คำอธิบาย:**
- `info` - ข้อมูลเกี่ยวกับ API
- `host` - URL ของเซิร์ฟเวอร์
- `outputFile` - ไฟล์ที่จะสร้างขึ้นอัตโนมัติ
- `routes` - ไฟล์หลักที่มี routes ทั้งหมด

---

## แก้ไขไฟล์ในโปรเจค

### 1. แก้ไขไฟล์ `package.json`

เพิ่ม script `swagger`:

```json
{
  "name": "member-api",
  "version": "1.0.0",
  "description": "Member Management API",
  "main": "src/index.js",
  "scripts": {
    "start": "nodemon src/index.js",
    "swagger": "node swagger.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.21.1",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "mysql2": "^3.9.0",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.21.1",
    "swagger-autogen": "^2.23.7"
  }
}
```

---

### 2. แก้ไขไฟล์ `src/index.js`

เพิ่ม Swagger UI:

```javascript
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');
const memberRoutes = require('./routes/member.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/members', memberRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Member Management API',
    version: '1.0.0',
    endpoints: {
      documentation: `http://localhost:${PORT}/api-docs`,
      members: `http://localhost:${PORT}/members`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'ไม่พบเส้นทาง API ที่ร้องขอ'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`📊 Members API: http://localhost:${PORT}/members`);
  console.log('='.repeat(50));
});
```

---

### 3. ไฟล์ `src/routes/member.routes.js`

**ไม่ต้องแก้ไขอะไร!** ใช้แบบเดิมได้เลย:

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/member.controller');

router.get('/', controller.getMembers);
router.get('/:id', controller.getMemberById);
router.post('/', controller.createMember);
router.put('/:id', controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;
```

**ข้อดี:** ไม่ต้องเขียน Comment ยาว ๆ เลย! Swagger จะ Auto Generate จาก Route ที่มีอยู่

---

## คำสั่งรันและทดสอบ

### 1. Generate Swagger Documentation

**รันคำสั่งนี้ทุกครั้งที่:**
- สร้างโปรเจคครั้งแรก
- แก้ไข Route
- เพิ่ม/ลบ Endpoint

```bash
npm run swagger
```

คำสั่งนี้จะสร้างไฟล์ `swagger-output.json` อัตโนมัติ

**ผลลัพธ์:**
```
Swagger-autogen
Endpoints detected: 5
Success! Swagger file generated.
```

---

### 2. รันเซิร์ฟเวอร์

```bash
npm start
```

**ผลลัพธ์:**
```
==================================================
🚀 Server: http://localhost:4000
📚 API Docs: http://localhost:4000/api-docs
📊 Members API: http://localhost:4000/members
==================================================
```

---

## ทดสอบ Swagger UI

### เปิดเบราว์เซอร์

ไปที่: **http://localhost:4000/api-docs**

คุณจะเห็นหน้า Swagger UI พร้อม:
- 📋 รายการ API Endpoints ทั้งหมด
- 🔍 คำอธิบายแต่ละ Endpoint
- 🧪 ปุ่ม "Try it out" สำหรับทดสอบ API ได้ทันที
- 📝 ตัวอย่าง Request/Response

---

## วิธีทดสอบผ่าน Swagger UI

### 1. ทดสอบ GET /members (ดึงสมาชิกทั้งหมด)

1. คลิกที่ `GET /members`
2. คลิกปุ่ม **"Try it out"**
3. คลิก **"Execute"**
4. ดู Response ด้านล่าง

---

### 2. ทดสอบ POST /members (สร้างสมาชิกใหม่)

1. คลิกที่ `POST /members`
2. คลิกปุ่ม **"Try it out"**
3. แก้ไข Request body:

```json
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "email": "somchai@example.com",
  "phone": "0812345678",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
}
```

4. คลิก **"Execute"**
5. ดู Response (ควรได้ 201 Created)

---

### 3. ทดสอบ GET /members/{id} (ดึงสมาชิกตาม ID)

1. คลิกที่ `GET /members/{id}`
2. คลิกปุ่ม **"Try it out"**
3. ใส่ `id` = `1` (หรือ ID ที่เพิ่งสร้าง)
4. คลิก **"Execute"**
5. ดู Response (ควรได้ 200 OK พร้อมข้อมูลสมาชิก)

---

### 4. ทดสอบ PUT /members/{id} (แก้ไขสมาชิก)

1. คลิกที่ `PUT /members/{id}`
2. คลิกปุ่ม **"Try it out"**
3. ใส่ `id` = `1`
4. แก้ไข Request body:

```json
{
  "firstName": "สมชาย",
  "lastName": "รักดี",
  "email": "somchai.updated@example.com",
  "phone": "0898765432",
  "address": "456 ถนนพระราม 4 กรุงเทพฯ"
}
```

5. คลิก **"Execute"**
6. ดู Response (ควรได้ 200 OK)

---

### 5. ทดสอบ DELETE /members/{id} (ลบสมาชิก)

1. คลิกที่ `DELETE /members/{id}`
2. คลิกปุ่ม **"Try it out"**
3. ใส่ `id` = `1`
4. คลิก **"Execute"**
5. ดู Response (ควรได้ 200 OK)

---

## โครงสร้างโปรเจคหลังเพิ่ม Swagger

```
member-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   └── member.controller.js
│   ├── routes/
│   │   └── member.routes.js        (ไม่ต้องแก้)
│   └── index.js                    (แก้: เพิ่ม Swagger UI)
├── .env
├── .gitignore
├── docker-compose.yml
├── package.json                    (แก้: เพิ่ม script)
├── swagger.js                      (ไฟล์ใหม่)
└── swagger-output.json             (Auto Generate)
```

---

## ข้อดีของวิธีนี้

| ข้อดี | รายละเอียด |
|-------|-----------|
| ✅ ไม่ต้องเขียน Comment | ไม่ต้องเขียน JSDoc ยาว ๆ ในไฟล์ route |
| ✅ Auto Generate | สร้าง Documentation อัตโนมัติจาก Code |
| ✅ อัปเดตง่าย | แก้ Route แล้วรัน `npm run swagger` ใหม่ได้ทันที |
| ✅ ทดสอบได้ทันที | มี UI สวยงามสำหรับทดสอบ API |
| ✅ ประหยัดเวลา | ไม่ต้องจัดรูปแบบ YAML/JSON เอง |

---

## (Optional) เพิ่มคำอธิบายเพิ่มเติม

ถ้าอยากเพิ่มคำอธิบายให้ละเอียดขึ้น สามารถเพิ่ม Comment แบบง่าย ๆ ในไฟล์ route:

```javascript
router.get('/', 
  // #swagger.tags = ['Members']
  // #swagger.description = 'ดึงรายการสมาชิกทั้งหมด'
  controller.getMembers
);

router.post('/', 
  // #swagger.tags = ['Members']
  // #swagger.description = 'สร้างสมาชิกใหม่'
  controller.createMember
);
```

แล้วรัน `npm run swagger` ใหม่

---

## Troubleshooting

### Problem: ไม่เจอไฟล์ swagger-output.json

**Solution:**
```bash
# รัน swagger ก่อน
npm run swagger

# แล้วค่อยรันเซิร์ฟเวอร์
npm start
```

---

### Problem: Swagger UI ไม่แสดงหรือ Error

**Solution:**
```bash
# ลบไฟล์เก่า
rm swagger-output.json

# Generate ใหม่
npm run swagger

# รันเซิร์ฟเวอร์ใหม่
npm start
```

---

### Problem: เพิ่ม Route แล้วไม่เห็นใน Swagger

**Solution:**
```bash
# ต้องรัน swagger ทุกครั้งที่แก้ Route
npm run swagger

# Restart เซิร์ฟเวอร์ (nodemon จะ restart อัตโนมัติ)
```

---

## สรุป

### ขั้นตอนการใช้งาน

1. **ติดตั้ง Package ครั้งแรก:**
   ```bash
   npm install swagger-ui-express
   npm install swagger-autogen --save-dev
   ```

2. **สร้างไฟล์ swagger.js และแก้ไข src/index.js**

3. **Generate Swagger Documentation:**
   ```bash
   npm run swagger
   ```

4. **รันเซิร์ฟเวอร์:**
   ```bash
   npm start
   ```

5. **เปิดเบราว์เซอร์:**
   - API Docs: http://localhost:4000/api-docs
   - API Server: http://localhost:4000

---

# Auto Generate Swagger ทุกครั้งที่แก้ไขไฟล์

## ไฟล์ที่ต้องสร้าง/แก้ไข

### 1. สร้างไฟล์ `nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "js",
  "ignore": ["swagger-output.json"],
  "exec": "node swagger.js && node src/index.js"
}
```

---

### 2. แก้ไขไฟล์ `package.json`

```json
{
  "name": "member-api",
  "version": "1.0.0",
  "description": "Member Management API",
  "main": "src/index.js",
  "scripts": {
    "start": "nodemon",
    "swagger": "node swagger.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.21.1",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "mysql2": "^3.9.0",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.21.1",
    "swagger-autogen": "^2.23.7"
  }
}
```

---

## รันเซิร์ฟเวอร์

```bash
npm start
```

---

## ผลลัพธ์

ตอนนี้ทุกครั้งที่แก้ไขไฟล์ใน `src/` จะ:

1. 🔄 **Auto Generate Swagger**
2. 🚀 **Auto Restart Server**

**ไม่ต้องรัน `npm run swagger` ด้วยตัวเองอีกต่อไป!** 🎉

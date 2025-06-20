// server.js

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 파일 저장 설정
const upload = multer({ dest: 'uploads/' });

// 제출 처리 라우트
app.post('/submit', upload.fields([
  { name: 'biz' }, { name: 'idcard' }, { name: 'bank' }
]), async (req, res) => {
  try {
    const {
      owner, name, phone, baeminId,
      partner, region, prepay, agree
    } = req.body;

    const files = req.files;

    // Nodemailer 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"D Pass 신청서" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: `[D PASS 신청서] ${name}님`,
      html: `
        <h2>신청 정보</h2>
        <ul>
          <li><strong>영업자:</strong> ${owner}</li>
          <li><strong>성함:</strong> ${name}</li>
          <li><strong>휴대폰번호:</strong> ${phone}</li>
          <li><strong>배민비즈회원아이디:</strong> ${baeminId}</li>
          <li><strong>협력사 운영여부:</strong> ${partner}</li>
          <li><strong>운영희망지역:</strong> ${region}</li>
          <li><strong>선정산 적용여부:</strong> ${prepay}</li>
          <li><strong>개인정보 동의:</strong> ${agree}</li>
        </ul>
      `,
      attachments: [
        {
          filename: files.biz?.[0]?.originalname || 'biz.pdf',
          path: files.biz?.[0]?.path
        },
        {
          filename: files.idcard?.[0]?.originalname || 'idcard.pdf',
          path: files.idcard?.[0]?.path
        },
        {
          filename: files.bank?.[0]?.originalname || 'bank.pdf',
          path: files.bank?.[0]?.path
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // 업로드된 파일 제거
    Object.values(files).forEach(fileArr => {
      fileArr.forEach(file => fs.unlink(file.path, () => {}));
    });

    res.send('신청서가 성공적으로 제출되었습니다.');
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('D Pass 서버 작동 중입니다.');
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

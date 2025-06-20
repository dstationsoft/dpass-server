const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 업로드 폴더 설정
const upload = multer({ dest: 'uploads/' });

// 폼 처리 라우터
app.post('/submit', upload.fields([
  { name: 'biz' },
  { name: 'idcard' },
  { name: 'bank' }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    // 이메일 전송 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_RECEIVER,
      subject: '디스테이션 디패스 회원가입 신청',
      html: `
        <h3>회원가입 정보</h3>
        <p><strong>영업자:</strong> ${formData.owner}</p>
        <p><strong>성함:</strong> ${formData.name}</p>
        <p><strong>휴대폰:</strong> ${formData.phone}</p>
        <p><strong>배민ID:</strong> ${formData.baeminId}</p>
        <p><strong>협력사 운영여부:</strong> ${formData.partner}</p>
        <p><strong>운영희망지역:</strong> ${formData.region}</p>
        <p><strong>선정산 적용여부:</strong> ${formData.prepay}</p>
        <p><strong>개인정보 동의:</strong> ${formData.agree ? '동의함' : '미동의'}</p>
      `,
      attachments: [
        {
          filename: files.biz?.[0]?.originalname || '사업자등록증',
          path: files.biz?.[0]?.path
        },
        {
          filename: files.idcard?.[0]?.originalname || '신분증',
          path: files.idcard?.[0]?.path
        },
        {
          filename: files.bank?.[0]?.originalname || '통장',
          path: files.bank?.[0]?.path
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.send('신청이 성공적으로 접수되었습니다.');
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

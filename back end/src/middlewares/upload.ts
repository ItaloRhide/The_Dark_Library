import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/covers';
    console.log(`[Multer] Tentando salvar em: ${dir}`);
    if (!fs.existsSync(dir)) {
      console.log(`[Multer] Criando diretório: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fname = 'cover-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`[Multer] Nome do arquivo gerado: ${fname}`);
    cb(null, fname);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Aumentado para 10MB para testes
  fileFilter: (req, file, cb) => {
    console.log(`[Multer] Recebendo arquivo: ${file.originalname} (${file.mimetype})`);
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    console.error(`[Multer] Tipo de arquivo não permitido: ${file.mimetype}`);
    cb(new Error('Apenas imagens (jpeg, jpg, png, webp) são permitidas!'));
  },
});

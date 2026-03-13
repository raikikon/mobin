/* ===================== FETCH PATCH (REQUIRED) ===================== */
global.fetch = async (url) => {
  const fs = require('fs');
  const path = require('path');

  if (typeof url === 'string' && url.endsWith('.wasm')) {
    const wasmPath = path.join(
      __dirname,
      '..',
      'node_modules',
      'zbar.wasm',
      'dist',
      'zbar.wasm'
    );

    return {
      arrayBuffer: async () => fs.readFileSync(wasmPath),
    };
  }

  throw new Error('Unsupported fetch URL: ' + url);
};
/* ================================================================= */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('zbar.wasm');

const {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} = require('@zxing/library');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ===================== UTILS ===================== */

const extractIMEI = (text = '') =>
  text.replace(/\s+/g, '').match(/\d{15}/)?.[0] || null;

const isValidIMEI = (imei) => /^\d{15}$/.test(imei);

/* ===================== ROUTE ===================== */

router.post('/decode', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
/* ===================== 1️⃣ ZBAR (PRIMARY) ===================== */
try {
  // Load image into canvas
  const img = await loadImage(req.file.buffer);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  // ✅ THIS IS WHAT ZBAR EXPECTS
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  // ✅ CORRECT API USAGE
  const symbols = await scanImageData(imageData);
  for (const sym of symbols) {
    const value = sym.decode();
    console.log(value)
    if (isValidIMEI(value)) {
      return res.json({
        source: 'zbar',
        imei: value,
        rawText: value,
      });
    }
  }
} catch (err) {
  console.warn('⚠️ ZBar failed:', err);
}


    /* ===================== 2️⃣ ZXING ===================== */

    try {
      const img = await loadImage(req.file.buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      const luminanceSource = new RGBLuminanceSource(
        imageData.data,
        img.width,
        img.height
      );

      const binaryBitmap = new BinaryBitmap(
        new HybridBinarizer(luminanceSource)
      );

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new MultiFormatReader();
      reader.setHints(hints);

      const result = reader.decode(binaryBitmap);
      const value = result.getText();

      if (isValidIMEI(value)) {
        return res.json({
        source: 'zbar',
        imei: value,
        rawText: value,
       });
      }
    } catch (err) {
      console.warn('⚠️ ZXing failed, falling back to OCR');
    }

    /* ===================== 3️⃣ OCR ===================== */

    

    return res.status(422).json({
      error: 'IMEI not detected',
      rawText: "none",
    });
  } catch (err) {
    console.error('❌ Decode error:', err);
    return res.status(500).json({ error: 'Decode failed' });
  }
});

router.post('/decodeserial', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    /* ===================== 1️⃣ ZBAR (PRIMARY) ===================== */
    try {
      const img = await loadImage(req.file.buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const symbols = await scanImageData(imageData);

      for (const sym of symbols) {
        const raw = sym.decode();
        const serial = extractSerial(raw);

        if (serial) {
          return res.json({
            source: 'zbar',
            serialNumber: serial,
            rawText: raw,
          });
        }
      }
    } catch (err) {
      console.warn('⚠️ ZBar serial decode failed:', err.message);
    }

    /* ===================== 2️⃣ ZXING (FALLBACK) ===================== */
    try {
      const img = await loadImage(req.file.buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      const luminanceSource = new RGBLuminanceSource(
        imageData.data,
        img.width,
        img.height
      );

      const binaryBitmap = new BinaryBitmap(
        new HybridBinarizer(luminanceSource)
      );

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new MultiFormatReader();
      reader.setHints(hints);

      const result = reader.decode(binaryBitmap);
      const raw = result.getText();

      const serial = extractSerial(raw);
      if (serial) {
        return res.json({
          source: 'zxing',
          serialNumber: serial,
          rawText: raw,
        });
      }
    } catch (err) {
      console.warn('⚠️ ZXing serial decode failed');
    }

    /* ===================== NOT FOUND ===================== */
    return res.status(422).json({
      error: 'Serial number not detected',
      serialNumber: null,
      rawText: 'none',
    });
  } catch (err) {
    console.error('❌ Serial decode error:', err);
    return res.status(500).json({ error: 'Decode failed' });
  }
});


module.exports = router;

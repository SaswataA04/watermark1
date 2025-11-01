const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const logoUpload = document.getElementById('logoUpload');
const textInput = document.getElementById('watermarkText');
const fontSizeInput = document.getElementById('fontSize');
const opacityInput = document.getElementById('opacity');
const rotationInput = document.getElementById('rotation');
const modeSelect = document.getElementById('mode');
const downloadBtn = document.getElementById('downloadBtn');
const dropZone = document.getElementById('dropZone');
const textControls = document.getElementById('textControls');
const logoControls = document.getElementById('logoControls');

let image = new Image();
let logo = new Image();
let logoPos = { x: 50, y: 50 };

function drawWatermark() {
  if (!image.src) return;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  const opacity = parseFloat(opacityInput.value);
  const rotation = parseFloat(rotationInput.value);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  if (modeSelect.value === 'text') {
    const text = textInput.value || 'WATERMARK';
    const fontSize = parseInt(fontSizeInput.value);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.textAlign = 'center';

    for (let y = fontSize; y < canvas.height; y += fontSize * 3) {
      for (let x = fontSize; x < canvas.width; x += fontSize * 8) {
        ctx.fillText(text, x, y);
      }
    }
  } else if (modeSelect.value === 'logo' && logo.src) {
    const logoWidth = 150;
    const logoHeight = 150 * (logo.height / logo.width);
    ctx.drawImage(logo, logoPos.x, logoPos.y, logoWidth, logoHeight);
  }

  ctx.restore();
}

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => image.src = reader.result;
  reader.readAsDataURL(file);
});

logoUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => logo.src = reader.result;
  reader.readAsDataURL(file);
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.background = '#dbeafe';
});
dropZone.addEventListener('dragleave', () => {
  dropZone.style.background = '';
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => image.src = reader.result;
    reader.readAsDataURL(file);
  }
});

image.onload = () => drawWatermark();
logo.onload = () => drawWatermark();

[fontSizeInput, opacityInput, rotationInput, textInput].forEach(el =>
  el.addEventListener('input', () => {
    document.getElementById('fontSizeValue').innerText = fontSizeInput.value;
    document.getElementById('opacityValue').innerText = opacityInput.value;
    document.getElementById('rotationValue').innerText = rotationInput.value;
    drawWatermark();
  })
);

modeSelect.addEventListener('change', () => {
  if (modeSelect.value === 'text') {
    textControls.style.display = 'block';
    logoControls.style.display = 'none';
  } else {
    textControls.style.display = 'none';
    logoControls.style.display = 'block';
  }
  drawWatermark();
});

downloadBtn.addEventListener('click', () => {
  if (!image.src) return;
  const link = document.createElement('a');
  link.download = 'watermarked.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

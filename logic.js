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
  ctx.translate(canvas.width / 2, canvas.height / 2); //Moves the origin (0,0) of the canvas to its center.Rotation in canvas always occurs around the origin, so this shifts rotation center to the middle of the image.
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2); //Moves the origin back to the top-left corner of the canvas.

  if (modeSelect.value === 'text') {
    const text = textInput.value;
    const fontSize = parseInt(fontSizeInput.value);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.textAlign = 'center';

    for (let y = fontSize; y < canvas.height; y += fontSize * 3) //Moves the text  vertically down the canvas.
       {
      for (let x = fontSize; x < canvas.width; x += fontSize * 8) //Moves horizontally across each row.
         {
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

//-------
// Attach an event listener to the <input type="file" id="logoUpload"> element
// This runs every time the user selects or changes a file in the input box
logoUpload.addEventListener('change', e => {

  // 'e' is the event object containing details about the file input change
  // 'e.target' refers to the <input> element that triggered the event
  // 'files' is a list (FileList) of all files selected by the user
  // 'files[0]' extracts the first file (we only handle one image here)
  const file = e.target.files[0];

  // If the user didn’t select any file, exit the function immediately
  if (!file) return;

  // Create a new FileReader instance to read the selected file from the user's computer
  const reader = new FileReader();

  // Define what happens when the file has been successfully read
  // 'reader.result' will contain the file data as a Base64-encoded Data URL
  // Assign that string to 'logo.src' so the <img> object can load the logo image
  reader.onload = () => logo.src = reader.result;

  // Start reading the selected file
  // 'readAsDataURL' converts the binary image file into a Base64 string
  // This allows it to be displayed directly in the browser without any server upload
  reader.readAsDataURL(file);
});
//-------

// Attach an event listener to the drop zone area for the 'dragover' event
// This event fires continuously when a file is being dragged over the element
dropZone.addEventListener('dragover', e => {

  // Prevent the browser's default behavior (which normally disallows file dropping)
  // Without this, the 'drop' event won’t trigger later
  e.preventDefault();

  // Give visual feedback to the user that the area is ready for dropping
  // Changes the background color to light blue (#dbeafe) while a file is dragged over
  dropZone.style.background = '#dbeafe';
});
//-------


// Attach an event listener to the drop zone for the 'dragleave' event
// This event triggers when the dragged file leaves the boundary of the drop zone
dropZone.addEventListener('dragleave', () => {

  // Reset the background color to its original state
  // This removes the visual highlight added during 'dragover'
  dropZone.style.background = '';
});

//-------


// Attach an event listener to the drop zone for the 'drop' event
// This event triggers when the user releases (drops) a dragged file onto the element
dropZone.addEventListener('drop', e => {

  // Prevent the browser’s default behavior (such as opening the image in a new tab)
  e.preventDefault();

  // Reset the background color to normal, removing the highlight applied during 'dragover'
  dropZone.style.background = '';

  // Access the dropped file using the DataTransfer object inside the event
  // 'dataTransfer.files' holds all files dropped by the user
  // Here we only handle the first one (index 0)
  const file = e.dataTransfer.files[0];

  // Proceed only if a valid file exists
  if (file) {
    // Create a FileReader instance to read the dropped file's content
    const reader = new FileReader();

    // Define what happens once the file is fully read
    // The 'result' property will contain the Base64-encoded image data
    // Assign it to the 'image.src' so it loads into the canvas for processing
    reader.onload = () => image.src = reader.result;

    // Begin reading the file as a Data URL (so it can be displayed directly)
    reader.readAsDataURL(file);
  }
});
//-------

image.onload = () => drawWatermark();
logo.onload = () => drawWatermark();

//-------
// Create an array of input elements: font size, opacity, rotation, and text
// The forEach() loop will attach the same event listener to each of them
[fontSizeInput, opacityInput, rotationInput, textInput].forEach(el =>

  // Add an event listener for the 'input' event
  // 'input' triggers every time the user changes the value (e.g., moves a slider or types text)
  el.addEventListener('input', () => {

    // Update the displayed numeric values beside each control in real time
    // These elements show the current slider/textbox values to the user
    document.getElementById('fontSizeValue').innerText = fontSizeInput.value;
    document.getElementById('opacityValue').innerText = opacityInput.value;
    document.getElementById('rotationValue').innerText = rotationInput.value;

    // Redraw the canvas with the updated watermark settings
    // This ensures instant visual feedback whenever a control value changes
    drawWatermark();
  })
);
//-------

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


let unitsSelect = document.getElementById('units-select');
let depthSlider = document.getElementById('depth-slider');
let depthValue = document.getElementById('depth-value');
let fileInput = document.querySelector('input[type="file"]');
let imageCanvas = document.getElementById('live-view-canvas');
let saveButton = document.getElementById('save-button');
let selectedUnit = unitsSelect.value;
let rawImageData = null;

// Load image from file input and draw to canvas
fileInput.addEventListener('change', function (event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let img = new Image();
            img.onload = function () {
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                let ctx = imageCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                rawImageData = ctx.getImageData(0, 0, img.width, img.height);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Adjusts image colors based on depth using an exponential attenuation model
function adjustForDepth(depth) {
    if (!rawImageData) return; // no image loaded
    const ctx = imageCanvas.getContext('2d');
    const imageData = ctx.createImageData(rawImageData);
    imageData.data.set(rawImageData.data);
    const data = imageData.data;

    // attenuation coefficients per channel (based on typical sea water)
    const k = { r: 0.15, g: 0.07, b: 0.03 };

    const redGain = Math.exp(k.r * depth);
    const greenGain = Math.exp(k.g * depth);
    const blueGain = Math.exp(k.b * depth);

    // normalise gains to preserve brightness
    const chromaNorm = 1.0 / Math.cbrt(redGain * greenGain * blueGain);

    // apply gains to each pixel
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * redGain * chromaNorm, 0, 255);
        data[i + 1] = clamp(data[i + 1] * greenGain * chromaNorm, 0, 255);
        data[i + 2] = clamp(data[i + 2] * blueGain * chromaNorm, 0, 255);
    }

    ctx.putImageData(imageData, 0, 0);
}

// Utility function to clamp values within a range
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Event listeners for controls
unitsSelect.addEventListener('change', function () {
    selectedUnit = unitsSelect.value;
    if (selectedUnit === 'meters') {
        depthSlider.max = 60;
        depthSlider.value = Math.min(depthSlider.value, 60);
    } else if (selectedUnit === 'feet') {
        depthSlider.max = 196;
        depthSlider.value = Math.min(depthSlider.value, 196);
    }
    updateDepthValue();
});

// Depth slider input updates the image in real time
depthSlider.addEventListener('input', function () {
    updateDepthValue();
    adjustForDepth(depthSlider.value / 2); // slider runs 0-60; depth in metres is half that
});

// Update depth value display
function updateDepthValue() {
    depthValue.innerHTML = depthSlider.value / 2 + ' ' + selectedUnit;
}

//download corrected image when save button is clicked
saveButton.addEventListener('click', function () {
    let link = document.createElement('a');
    link.download = 'corrected_image.png';
    link.href = imageCanvas.toDataURL();
    link.click();
});

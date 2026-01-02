
let unitsSelect = document.getElementById('units-select');
let depthSlider = document.getElementById('depth-slider');
let depthValue = document.getElementById('depth-value');
let fileInput = document.querySelector('input[type="file"]');
let imageCanvas = document.getElementById('live-view-canvas');
let saveButton = document.getElementById('save-button');
let selectedUnit = unitsSelect.value;
let rawImageData = null;

fileInput.addEventListener('change', function(event){
    let file = event.target.files[0];
    if(file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = new Image();
            img.onload = function() {
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                imageCanvas.scale
                let ctx = imageCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width,    img.height); // 0, 0, imageCanvas.width, imageCanvas.height);
                rawImageData = ctx.getImageData(0, 0, img.width, img.height);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

function adjustForDepth(depth) {
    const ctx = imageCanvas.getContext('2d');
    const imageData = ctx.createImageData(rawImageData);
    imageData.data.set(rawImageData.data);
    const data = imageData.data;

    const k = { r: 0.15, g: 0.07, b: 0.03 };

    const redGain   = Math.exp(k.r * depth);
    const greenGain = Math.exp(k.g * depth);
    const blueGain  = Math.exp(k.b * depth);
    const chromaNorm = 1.0 / Math.cbrt(redGain * greenGain * blueGain);

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] * redGain * chromaNorm, 0, 255);
        data[i + 1] = clamp(data[i + 1] * greenGain * chromaNorm, 0, 255);
        data[i + 2] = clamp(data[i + 2] * blueGain  * chromaNorm, 0, 255);
    }

    ctx.putImageData(imageData, 0, 0);
}

function srgbToLinear(c) {
    c = c/255;
    if( c <= 0.04045 ) {
        return c / 12.92;
    }
    else{
        return Math.pow((c + 0.055) / 1.055, 2.4);
    }
}

function linearToSrgb(c) {
    if(c <= 0.0031308) {
        return 255 * (c * 12.92);
    }
    else{
        return 255 * (1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    }
}


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


unitsSelect.addEventListener('change', function() {
    selectedUnit = unitsSelect.value;
    if(selectedUnit === 'meters') {
        depthSlider.max = 60;
        depthSlider.value = Math.min(depthSlider.value, 60);
    }
    else if(selectedUnit === 'feet') {
        depthSlider.max = 196;
        depthSlider.value = Math.min(depthSlider.value, 196);
    }
    updateDepthValue();
    updateDistanceValue();
});
depthSlider.addEventListener('input', function() {
    updateDepthValue();
    adjustForDepth(depthSlider.value/2); // divide by 2 to convert to meters
});
function updateDepthValue() {
    depthValue.innerHTML = depthSlider.value/2 + ' ' + selectedUnit;
}
saveButton.addEventListener('click', function() {
    let link = document.createElement('a');
    link.download = 'corrected_image.png';
    link.href = imageCanvas.toDataURL();
    link.click();
});
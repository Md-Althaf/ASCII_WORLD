
let cameraBtn = document.getElementById("cameraBtn");
let uploadBtn = document.getElementById("uploadBtn");

let imageInput = document.getElementById("imageInput");

let asciiText = document.getElementById("asciiText");
let status = document.getElementById("status");

let downloadBtn = document.getElementById("downloadBtn");
let clearBtn = document.getElementById("clearBtn");

let video = document.getElementById("video");
let startBtn = document.getElementById("startBtn");
let stopBtn = document.getElementById("stopBtn");

let cameraStatus = document.getElementById("cameraStatus");
let cameraPlaceholder = document.getElementById("cameraPlaceholder");

let asciiCharacters = "@#W$9876543210?!abc;:+=-,._ ";



cameraBtn.addEventListener("click", function() {

    cameraBtn.classList.add("active");
    uploadBtn.classList.remove("active");

    cameraStatus.textContent = "CAMERA MODE";

});

uploadBtn.addEventListener("click", function() {

    uploadBtn.classList.add("active");
    cameraBtn.classList.remove("active");

    status.textContent = "IMAGE MODE";

});



imageInput.addEventListener("change", function() {

    let file = imageInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        status.textContent = "INVALID IMAGE";
        return;
    }

    let image = new Image();

    image.onload = function() {

        convertToAscii(image);

        URL.revokeObjectURL(image.src);

    };

    image.onerror = function() {

        status.textContent = "IMAGE ERROR";

        URL.revokeObjectURL(image.src);

    };

    image.src = URL.createObjectURL(file);

    status.textContent = "CONVERTING...";

});



function convertToAscii(image) {

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    let width = 100;
    let height = Math.round(image.height / image.width * width);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);

    let imageData = ctx.getImageData(0, 0, width, height);
    let pixels = imageData.data;

    let asciiArt = "";

    for (let y = 0; y < height; y++) {

        for (let x = 0; x < width; x++) {

            let pixel = (y * width + x) * 4;

            let red = pixels[pixel];
            let green = pixels[pixel + 1];
            let blue = pixels[pixel + 2];

            let brightness = (red + green + blue) / 3;

            let charIndex = Math.floor(
                brightness / 256 * asciiCharacters.length
            );

            asciiArt += asciiCharacters[charIndex];

        }

        asciiArt += "\n";

    }

    asciiText.textContent = asciiArt;

    status.textContent = "DONE";

}



downloadBtn.addEventListener("click", function() {

    let art = asciiText.textContent;

    let file = new Blob([art], {
        type: "text/plain"
    });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "ascii-art.txt";

    link.click();

    URL.revokeObjectURL(link.href);

});


clearBtn.addEventListener("click", function() {

    asciiText.textContent = "SELECT AN IMAGE";

    status.textContent = "READY";

    imageInput.value = "";

});



startBtn.addEventListener("click", function() {

    cameraStatus.textContent = "READY";

});

stopBtn.addEventListener("click", function() {

    cameraStatus.textContent = "OFFLINE";

});


console.log("ASCII STUDIO READY");

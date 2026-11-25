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

let cameraStream = null;
let cameraRunning = false;
let cameraFrame = null;

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

cameraBtn.addEventListener("click", function() {
    cameraBtn.classList.add("active");
    uploadBtn.classList.remove("active");
    status.textContent = "CAMERA MODE";
});

uploadBtn.addEventListener("click", function() {
    uploadBtn.classList.add("active");
    cameraBtn.classList.remove("active");
    stopCamera();
    status.textContent = "IMAGE MODE";
});

startBtn.addEventListener("click", async function() {
    try {
        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        video.srcObject = cameraStream;
        await video.play();

        cameraRunning = true;
        video.style.display = "block";
        cameraPlaceholder.style.display = "none";

        cameraStatus.textContent = "CONNECTED";
        status.textContent = "LIVE";

        cameraBtn.classList.add("active");
        uploadBtn.classList.remove("active");

        showCamera();

    } catch(error) {
        cameraStatus.textContent = "ERROR";
        status.textContent = "CAMERA FAILED";
        console.log(error);
    }
});

stopBtn.addEventListener("click", function() {
    stopCamera();
});

function stopCamera() {
    cameraRunning = false;

    if (cameraFrame) {
        cancelAnimationFrame(cameraFrame);
        cameraFrame = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(function(track) {
            track.stop();
        });

        cameraStream = null;
    }

    video.srcObject = null;
    video.style.display = "none";
    cameraPlaceholder.style.display = "block";

    cameraStatus.textContent = "OFFLINE";
    status.textContent = "READY";
}

function showCamera() {
    if (!cameraRunning) return;

    if (video.videoWidth === 0) {
        cameraFrame = requestAnimationFrame(showCamera);
        return;
    }

    let width = 100;
    let height = Math.round(video.videoHeight / video.videoWidth * width * 0.5);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);

    let pixels = ctx.getImageData(0, 0, width, height).data;
    let asciiArt = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let pixel = (y * width + x) * 4;

            let red = pixels[pixel];
            let green = pixels[pixel + 1];
            let blue = pixels[pixel + 2];

            let brightness = red * 0.299 + green * 0.587 + blue * 0.114;
            let charIndex = Math.floor(brightness / 256 * asciiCharacters.length);

            asciiArt += asciiCharacters[charIndex];
        }

        asciiArt += "\n";
    }

    asciiText.textContent = asciiArt;
    cameraFrame = requestAnimationFrame(showCamera);
}

imageInput.addEventListener("change", function() {
    let file = imageInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        status.textContent = "INVALID IMAGE";
        return;
    }

    stopCamera();

    cameraBtn.classList.remove("active");
    uploadBtn.classList.add("active");

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
    let width = 100;
    let height = Math.round(image.height / image.width * width * 0.5);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);

    let pixels = ctx.getImageData(0, 0, width, height).data;
    let asciiArt = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let pixel = (y * width + x) * 4;

            let red = pixels[pixel];
            let green = pixels[pixel + 1];
            let blue = pixels[pixel + 2];

            let brightness = red * 0.299 + green * 0.587 + blue * 0.114;
            let charIndex = Math.floor(brightness / 256 * asciiCharacters.length);

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
    stopCamera();

    asciiText.textContent = "SELECT AN IMAGE";
    status.textContent = "READY";

    imageInput.value = "";
});

console.log("ASCII STUDIO READY");
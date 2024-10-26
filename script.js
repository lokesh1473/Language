const fromText = document.querySelector(".from-text"),
    toText = document.querySelector(".to-text"),
    translateBtn = document.querySelector(".translate-btn"),
    micBtn = document.querySelector(".mic-btn"),
    pdfUpload = document.getElementById("pdf-upload"),
    fromLangSelect = document.getElementById("from-language"),
    toLangSelect = document.getElementById("to-language");

// this is language list i kept only 10 so adjust ra 
const languages = {
    "en-GB": "English",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "zh-CN": "Chinese (Simplified)",
    "ja-JP": "Japanese",
    "ru-RU": "Russian",
    "it-IT": "Italian",
    "hi-IN": "Hindi",
    "pt-PT": "Portuguese",
    "te-TE": "Telugu",
    "ml-ML": "Malayalam"
};


for (let code in languages) {
    const option = `<option value="${code}">${languages[code]}</option>`;
    fromLangSelect.insertAdjacentHTML("beforeend", option);
    toLangSelect.insertAdjacentHTML("beforeend", option);
}


document.querySelector(".exchange").addEventListener("click", () => {
    [fromLangSelect.value, toLangSelect.value] = [toLangSelect.value, fromLangSelect.value];
});

// this is function for pdf extraction to texttttttt so you can use text 
pdfUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let text = "";

            
            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const content = await page.getTextContent();
                
                
                const pageText = content.items.map(item => item.str).join(" ");
                text += pageText + "\n";
            }
            
            fromText.value = text.trim();
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        alert("Please upload a valid PDF file.");
    }
});

// this function is to transtslate from one language to another language 
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
        translateFrom = fromLangSelect.value,
        translateTo = toLangSelect.value;

    if (!text) return;

    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            toText.value = data.responseData.translatedText;
            toText.setAttribute("placeholder", "Translation");
        })
        .catch(() => {
            toText.setAttribute("placeholder", "Failed to translate");
        });
});

// this below code is for voice recognition in this voice can be converted to text onlyyyyyy
micBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = fromLangSelect.value;
    recognition.start();

    recognition.onstart = () => {
        micBtn.style.backgroundColor = "green";
    };

    recognition.onspeechend = () => {
        recognition.stop();
        micBtn.style.backgroundColor = "red";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        fromText.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };
});

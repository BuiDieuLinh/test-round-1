
(function () {
    'use strict';

    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const messageBanner = document.getElementById("message");
    const resultSection = document.getElementById("result");
    const uniqueWordsEl = document.getElementById("uniqueWords");
    const topWordsTableBody = document.getElementById("topWords");

    let worker;
    try {
        worker = new Worker("validate.js");
    } catch (e) {
        console.error("Failed to initialize Web Worker:", e);
    }

    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragover");
        
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener("change", (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener("click", (event) => {
        if (event.target !== fileInput && event.target.tagName !== "LABEL") {
            fileInput.click();
        }
    });

    function handleFile(file) {
        clearUI();

        if (!file.name.toLowerCase().endsWith(".txt")) {
            showError("Chỉ chấp nhận các tệp tin .txt.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const content = event.target.result;
            if (!worker) {
                processTextLocally(content);
                return;
            }
            worker.postMessage(content);
        };

        reader.onerror = function () {
            showError("Không thể đọc tệp tin đã chọn.");
        };

        reader.readAsText(file);
    }

    if (worker) {
        worker.onmessage = function (event) {
            const data = event.data;
            if (!data.success) {
                showError(data.message);
                return;
            }
            showSuccess("Hoàn thành phân tích thành công!");
            renderResult(data);
        };
    }
    
    function renderResult(data) {
        resultSection.classList.remove("hidden");
        uniqueWordsEl.textContent = Number(data.uniqueWords).toLocaleString();

        topWordsTableBody.innerHTML = "";

        data.topThree.forEach((item, index) => {
            const row = document.createElement("tr");

            const rankCell = document.createElement("td");
            rankCell.innerHTML = `<span class="rank-badge rank-${index + 1}">${index + 1}</span>`;
            
            const wordCell = document.createElement("td");
            wordCell.className = "word-column";
            wordCell.textContent = item.word;

            const countCell = document.createElement("td");
            countCell.textContent = Number(item.count).toLocaleString();

            row.appendChild(rankCell);
            row.appendChild(wordCell);
            row.appendChild(countCell);

            topWordsTableBody.appendChild(row);
        });

        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearUI() {
        messageBanner.textContent = "";
        messageBanner.className = "message-banner";
        resultSection.classList.add("hidden");
        uniqueWordsEl.textContent = "0";
        topWordsTableBody.innerHTML = "";
    }

    function showError(text) {
        messageBanner.textContent = text;
        messageBanner.className = "message-banner error";
    }

    function showSuccess(text) {
        messageBanner.textContent = text;
        messageBanner.className = "message-banner success";
    }

    function processTextLocally(text) {
        const regex = /^[a-zA-Z.,\s]+$/;
        if (!regex.test(text)) {
            showError("Tệp tin không hợp lệ. Chỉ chấp nhận chữ cái, dấu chấm, dấu phẩy và khoảng trắng.");
            return;
        }

        let normalized = text.toLowerCase().replace(/[.,]/g, " ");
        const words = normalized.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) {
            showError("Tệp tin trống.");
            return;
        }

        const wordMap = {};
        words.forEach(w => {
            wordMap[w] = (wordMap[w] || 0) + 1;
        });

        const uniqueKeys = Object.keys(wordMap);
        if (uniqueKeys.length < 3) {
            showError("Tệp tin phải chứa ít nhất 3 từ khác nhau.");
            return;
        }

        const topThree = Object.entries(wordMap)
            .sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0]))
            .slice(0, 3)
            .map(([word, count]) => ({ word, count }));

        showSuccess("Hoàn thành phân tích (Dự phòng cục bộ)!");
        renderResult({ uniqueWords: uniqueKeys.length, topThree });
    }

})();
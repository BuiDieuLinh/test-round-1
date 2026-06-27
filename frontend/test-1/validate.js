self.onmessage = function (event) {
    try {
        let text = event.data;

        const regex = /^[a-zA-Z.,\s]+$/;
        if (!regex.test(text)) {
            self.postMessage({
                success: false,
                message: "Tệp tin không hợp lệ. Chỉ chấp nhận các ký tự chữ cái, dấu chấm, dấu phẩy và khoảng trắng."
            });
            return;
        }

        text = text.toLowerCase();
        text = text.replace(/[.,]/g, " ");

        const words = text
            .split(/\s+/)
            .filter(word => word.length > 0);

        if (words.length === 0) {
            self.postMessage({
                success: false,
                message: "Tệp tin trống."
            });
            return;
        }

        const wordMap = {};
        for (const word of words) {
            wordMap[word] = (wordMap[word] || 0) + 1;
        }

        const uniqueWords = Object.keys(wordMap);
        if (uniqueWords.length < 3) {
            self.postMessage({
                success: false,
                message: "Tệp tin phải chứa ít nhất 3 từ khác nhau để trích xuất tần suất cao nhất."
            });
            return;
        }

        const topThree = Object.entries(wordMap)
            .sort((a, b) => {
                if (b[1] !== a[1]) {
                    return b[1] - a[1];
                }
                return a[0].localeCompare(b[0]);
            })
            .slice(0, 3)
            .map(([word, count]) => ({
                word,
                count
            }));

        self.postMessage({
            success: true,
            uniqueWords: uniqueWords.length,
            topThree
        });

    } catch (error) {
        self.postMessage({
            success: false,
            message: "Đã xảy ra lỗi không xác định khi xử lý tệp tin ở luồng chạy nền."
        });
    }
};
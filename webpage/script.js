document.getElementById('extractButton').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const outputElement = document.getElementById('output');
    const loader = document.getElementById('loader');

    if (!file) {
        alert('Please select a file.');
        return;
    }

    loader.style.display = 'block';
    outputElement.textContent = '';

    const fileType = file.type;

    if (fileType === 'application/pdf') {
        // Handle PDF file
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);

            // Load PDF using pdf.js
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                let totalPages = pdf.numPages;
                let pageText = '';

                function processPage(pageNumber) {
                    pdf.getPage(pageNumber).then(function(page) {
                        const scale = 2;  // Scale factor for better image quality
                        const viewport = page.getViewport({ scale });

                        // Prepare canvas for rendering the PDF page as an image
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };

                        page.render(renderContext).promise.then(function() {
                            // Convert canvas to image and pass it to Tesseract.js
                            canvas.toBlob(function(blob) {
                                Tesseract.recognize(
                                    blob,
                                    'eng',
                                    {
                                        logger: function(m) {
                                            console.log(m);
                                            if (m.status === 'recognizing text') {
                                                loader.textContent = `Processing page ${pageNumber}... ${Math.round(m.progress * 100)}% done`;
                                            }
                                        }
                                    }
                                ).then(function(result) {
                                    pageText += result.data.text + '\n\n';

                                    if (pageNumber < totalPages) {
                                        processPage(pageNumber + 1);  // Process next page
                                    } else {
                                        loader.style.display = 'none';
                                        outputElement.textContent = pageText;
                                    }
                                }).catch(function(err) {
                                    loader.style.display = 'none';
                                    outputElement.textContent = 'Error: ' + err.message;
                                });
                            });
                        });
                    });
                }

                // Start processing the first page
                processPage(1);
            }).catch(function(err) {
                loader.style.display = 'none';
                outputElement.textContent = 'Error loading PDF: ' + err.message;
            });
        };

        // Read the PDF file as an ArrayBuffer
        fileReader.readAsArrayBuffer(file);
    } else {
        // Handle image file
        Tesseract.recognize(
            file,
            'eng',  // You can add other languages if necessary
            {
                logger: function (m) {
                    console.log(m);  // Log progress
                    if (m.status === 'recognizing text') {
                        loader.textContent = `Processing... ${Math.round(m.progress * 100)}% done`;
                    }
                }
            }
        ).then(function (result) {
            loader.style.display = 'none';
            outputElement.textContent = result.data.text;
        }).catch(function (err) {
            loader.style.display = 'none';
            outputElement.textContent = 'Error: ' + err.message;
        });
    }
});


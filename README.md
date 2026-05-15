# LeafScan AI

LeafScan AI is a frontend-only academic prototype for detecting possible diseases in lemon leaves. It uses a Teachable Machine image classification model exported to TensorFlow.js, runs entirely in the browser, and saves analysis history with LocalStorage.

## Stack

- HTML
- CSS
- JavaScript
- TensorFlow.js
- Teachable Machine image library
- LocalStorage

No frameworks, bundlers, Node.js, npm, backend, database, or external CSS libraries are required.

## Project Structure

```text
LeafScan-AI/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How to Run Locally

Open `index.html` directly in a browser for upload-based testing.

For camera capture, run the app from a local server because browsers usually require `localhost` or HTTPS for camera access:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to Create a Teachable Machine Model

1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/).
2. Create an Image Project.
3. Add image classes for lemon leaf conditions.
4. Upload representative images for each class.
5. Train the model.
6. Click Export Model.
7. Choose TensorFlow.js.
8. Upload or host the model.
9. Copy the generated model URL.

## How to Replace `MODEL_URL`

Open `script.js` and replace:

```js
const MODEL_URL = "PASTE_YOUR_TEACHABLE_MACHINE_MODEL_URL_HERE";
```

with your hosted Teachable Machine model URL. The URL should be the folder path that contains:

```text
model.json
metadata.json
weights.bin
```

Example:

```js
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/your-model-id/";
```

After updating the URL, reload the page. The app will load `model.json` and `metadata.json`, classify uploaded or captured images, sort predictions by highest probability, and display the top result.

## Suggested Disease Classes

Use these class names in Teachable Machine for the best UI match:

- Healthy Leaf
- Citrus Canker
- Black Spot
- Greening
- Melanose
- Anthracnose
- Dry Leaf
- Nutrient Deficiency
- Sooty Mold

If your model uses different class names, the app will still show predictions, but unmatched classes will use fallback educational text.

## Features

- Modern responsive landing page
- Upload image analysis
- Optional browser camera capture
- Teachable Machine TensorFlow.js integration
- Top prediction and confidence score
- All class probabilities
- Disease severity, description, and recommendations
- Low confidence warning below 70%
- LocalStorage analysis history
- Clear history control
- Friendly warning when the model URL has not been configured

## Academic Disclaimer

LeafScan AI is an academic and educational prototype. It is not a certified diagnostic tool and should not replace professional agricultural inspection, laboratory testing, or local extension service guidance.

## Future Improvements

- Train with larger field image datasets from multiple lighting conditions.
- Add model validation metrics and confusion matrix reporting.
- Support offline model hosting inside the project folder.
- Add multilingual educational content.
- Add exportable PDF or CSV reports.
- Improve camera guidance with leaf framing feedback.

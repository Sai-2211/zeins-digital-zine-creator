# ZEINS - Digital Zine Creator

A full-stack web application for creating and managing digital zines using Markdown.

## Features

- **Markdown Editor**: Write content using SimpleMDE markdown editor
- **Save & Manage**: Save zines as JSON objects locally
- **Export to PDF**: Convert zines to PDF format
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-save Drafts**: Automatically saves work in progress
- **Interactive User Guide**: First-time user tutorial and help system
- **Keyboard Shortcuts**: Quick access to common functions

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Editor**: SimpleMDE (Markdown)
- **Backend**: Python Flask
- **Storage**: JSON file (`zines_data.json`)
- **PDF Export**: html2pdf.js
- **Markdown Parsing**: marked.js

## Local Setup

1. **Clone or download the project:**
   ```bash
   cd zeins-app
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000`

## Project Structure

```
zeins-app/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── zines_data.json       # Data storage (created automatically)
├── templates/
│   ├── index.html        # Editor page
│   └── view_zines.html   # View zines page
└── static/
    ├── css/
    │   └── style.css     # Main stylesheet
    ├── js/
    │   ├── app.js        # Editor page JavaScript
    │   └── view.js       # View page JavaScript
    └── images/
        └── favicon.ico   # Favicon
```

## API Endpoints

- `GET /` - Home page with editor
- `GET /view` - View all saved zines
- `POST /save` - Save a new zine
- `GET /zines` - Get list of all zines
- `GET /zine/<id>` - Get specific zine by ID
- `DELETE /delete/<id>` - Delete specific zine

## Deployment on Render.com

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Use these settings:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Environment:** Python 3

4. **Deploy and enjoy!**

## Usage

### Creating a Zine
1. Enter a title for your zine
2. Write content using Markdown in the editor
3. Use the toolbar for formatting (bold, italic, lists, etc.)
4. Click "Save Zine" to save your work

### Managing Zines
1. Click "View Zines" to see all saved zines
2. Click "View" on any zine card to read the full content
3. Export individual zines to PDF
4. Delete zines you no longer need

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save current zine
- `Ctrl/Cmd + P` - Export to PDF
- `Escape` - Close modals
- `R` - Refresh zines list (on view page)

## Features in Detail

### Markdown Support
- Headers (# ## ###)
- **Bold** and *italic* text
- Lists (ordered and unordered)
- Links and images
- Code blocks and inline code
- Blockquotes

### Dark Mode
- Automatically adapts to system preference
- Manual toggle available
- Persistent across sessions

### Auto-save
- Drafts are automatically saved locally
- Resume work where you left off
- Cleared after successful save

## License

Open source project. Feel free to modify and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.

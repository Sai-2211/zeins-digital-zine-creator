from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# Path to the JSON data file
DATA_FILE = 'zines_data.json'

def load_zines():
    """Load zines from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_zines(zines):
    """Save zines to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(zines, f, indent=2, ensure_ascii=False)

@app.route('/')
def index():
    """Serve the home page with editor"""
    return render_template('index.html')

@app.route('/view')
def view_zines():
    """Serve the page to view all zines"""
    return render_template('view_zines.html')

@app.route('/save', methods=['POST'])
def save_zine():
    """Save a new zine"""
    try:
        data = request.get_json()
        
        if not data or 'title' not in data or 'content' not in data:
            return jsonify({'error': 'Title and content are required'}), 400
        
        # Load existing zines
        zines = load_zines()
        
        # Create new zine entry
        new_zine = {
            'id': str(uuid.uuid4()),
            'title': data['title'].strip(),
            'content': data['content'],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Add to zines list
        zines.append(new_zine)
        
        # Save to file
        save_zines(zines)
        
        return jsonify({'message': 'Zine saved successfully', 'id': new_zine['id']}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to save zine: {str(e)}'}), 500

@app.route('/zines', methods=['GET'])
def get_zines():
    """Get all saved zines"""
    try:
        zines = load_zines()
        # Return basic info for listing
        zines_list = [
            {
                'id': zine['id'],
                'title': zine['title'],
                'created_at': zine['created_at'],
                'preview': zine['content'][:100] + '...' if len(zine['content']) > 100 else zine['content']
            }
            for zine in zines
        ]
        return jsonify(zines_list), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load zines: {str(e)}'}), 500

@app.route('/zine/<zine_id>', methods=['GET'])
def get_zine(zine_id):
    """Get a specific zine by ID"""
    try:
        zines = load_zines()
        
        # Find zine by ID or title
        zine = None
        for z in zines:
            if z['id'] == zine_id or z['title'].lower() == zine_id.lower():
                zine = z
                break
        
        if not zine:
            return jsonify({'error': 'Zine not found'}), 404
        
        return jsonify(zine), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to load zine: {str(e)}'}), 500

@app.route('/delete/<zine_id>', methods=['DELETE'])
def delete_zine(zine_id):
    """Delete a specific zine by ID"""
    try:
        zines = load_zines()
        
        # Find and remove zine by ID
        original_length = len(zines)
        zines = [z for z in zines if z['id'] != zine_id]
        
        if len(zines) == original_length:
            return jsonify({'error': 'Zine not found'}), 404
        
        save_zines(zines)
        return jsonify({'message': 'Zine deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete zine: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

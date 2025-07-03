from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import os
from datetime import datetime
import uuid
import hashlib
from functools import wraps

app = Flask(__name__)
app.secret_key = 'zeins-secret-key-change-in-production'  # Change this in production!

# Path to the JSON data files
ZINES_DATA_FILE = 'zines_data.json'
USERS_DATA_FILE = 'users_data.json'

def load_zines():
    """Load zines from JSON file"""
    if os.path.exists(ZINES_DATA_FILE):
        try:
            with open(ZINES_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_zines(zines):
    """Save zines to JSON file"""
    with open(ZINES_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(zines, f, indent=2, ensure_ascii=False)

def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_DATA_FILE):
        try:
            with open(USERS_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    """Serve the home page - public zines browse"""
    return render_template('browse.html')

@app.route('/login')
def login():
    """Serve the login page"""
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/signup')
def signup():
    """Serve the signup page"""
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/create')
@login_required
def create():
    """Serve the zine creation page"""
    return render_template('create.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    """Handle login authentication"""
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        users = load_users()
        username = data['username'].strip().lower()
        password = data['password']
        
        # Find user
        user = None
        for u in users:
            if u['username'].lower() == username:
                user = u
                break
        
        if not user or user['password'] != hash_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Set session
        session['user_id'] = user['id']
        session['username'] = user['username']
        
        return jsonify({'message': 'Login successful', 'username': user['username']}), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/auth/signup', methods=['POST'])
def auth_signup():
    """Handle user registration"""
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        users = load_users()
        
        # Check if username already exists
        for user in users:
            if user['username'].lower() == username.lower():
                return jsonify({'error': 'Username already exists'}), 400
        
        # Create new user
        new_user = {
            'id': str(uuid.uuid4()),
            'username': username,
            'password': hash_password(password),
            'created_at': datetime.now().isoformat()
        }
        
        users.append(new_user)
        save_users(users)
        
        # Set session
        session['user_id'] = new_user['id']
        session['username'] = new_user['username']
        
        return jsonify({'message': 'Account created successfully', 'username': new_user['username']}), 200
        
    except Exception as e:
        return jsonify({'error': f'Signup failed: {str(e)}'}), 500

@app.route('/auth/logout')
def auth_logout():
    """Handle user logout"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/my-zines')
@login_required
def my_zines():
    """Serve the page to view user's own zines"""
    return render_template('my_zines.html')

@app.route('/user/<username>')
@login_required
def user_profile(username):
    """Serve the user profile page"""
    users = load_users()
    user = None
    for u in users:
        if u['username'].lower() == username.lower():
            user = u
            break
    
    if not user:
        return redirect(url_for('index'))
    
    return render_template('user_profile.html', profile_user=user)

@app.route('/save', methods=['POST'])
@login_required
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
            'visibility': data.get('visibility', 'private'),  # private or public
            'author_id': session['user_id'],
            'author_username': session['username'],
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

@app.route('/api/zines/public', methods=['GET'])
@login_required
def get_public_zines():
    """Get all public zines"""
    try:
        zines = load_zines()
        # Return only public zines
        public_zines = [
            {
                'id': zine['id'],
                'title': zine['title'],
                'author_username': zine.get('author_username', 'Anonymous'),
                'created_at': zine['created_at'],
                'preview': zine['content'][:100] + '...' if len(zine['content']) > 100 else zine['content']
            }
            for zine in zines if zine.get('visibility', 'private') == 'public'
        ]
        # Sort by creation date (newest first)
        public_zines.sort(key=lambda x: x['created_at'], reverse=True)
        return jsonify(public_zines), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load public zines: {str(e)}'}), 500

@app.route('/api/zines/my', methods=['GET'])
@login_required
def get_my_zines():
    """Get current user's zines"""
    try:
        zines = load_zines()
        # Return only current user's zines
        my_zines = [
            {
                'id': zine['id'],
                'title': zine['title'],
                'visibility': zine.get('visibility', 'private'),
                'created_at': zine['created_at'],
                'preview': zine['content'][:100] + '...' if len(zine['content']) > 100 else zine['content']
            }
            for zine in zines if zine.get('author_id') == session['user_id']
        ]
        # Sort by creation date (newest first)
        my_zines.sort(key=lambda x: x['created_at'], reverse=True)
        return jsonify(my_zines), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load your zines: {str(e)}'}), 500

@app.route('/api/zines/user/<username>', methods=['GET'])
@login_required
def get_user_zines(username):
    """Get a specific user's public zines"""
    try:
        zines = load_zines()
        # Return only the specified user's public zines
        user_zines = [
            {
                'id': zine['id'],
                'title': zine['title'],
                'author_username': zine.get('author_username', 'Anonymous'),
                'created_at': zine['created_at'],
                'preview': zine['content'][:100] + '...' if len(zine['content']) > 100 else zine['content']
            }
            for zine in zines 
            if zine.get('author_username', '').lower() == username.lower() 
            and zine.get('visibility', 'private') == 'public'
        ]
        # Sort by creation date (newest first)
        user_zines.sort(key=lambda x: x['created_at'], reverse=True)
        return jsonify(user_zines), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load user zines: {str(e)}'}), 500

@app.route('/api/zine/<zine_id>', methods=['GET'])
@login_required
def get_zine(zine_id):
    """Get a specific zine by ID"""
    try:
        zines = load_zines()
        
        # Find zine by ID
        zine = None
        for z in zines:
            if z['id'] == zine_id:
                zine = z
                break
        
        if not zine:
            return jsonify({'error': 'Zine not found'}), 404
        
        # Check permissions
        if zine.get('visibility', 'private') == 'private' and zine.get('author_id') != session['user_id']:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(zine), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to load zine: {str(e)}'}), 500

@app.route('/api/delete/<zine_id>', methods=['DELETE'])
@login_required
def delete_zine(zine_id):
    """Delete a specific zine by ID"""
    try:
        zines = load_zines()
        
        # Find zine and check ownership
        zine_to_delete = None
        for zine in zines:
            if zine['id'] == zine_id:
                zine_to_delete = zine
                break
        
        if not zine_to_delete:
            return jsonify({'error': 'Zine not found'}), 404
        
        if zine_to_delete.get('author_id') != session['user_id']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Remove zine
        zines = [z for z in zines if z['id'] != zine_id]
        save_zines(zines)
        return jsonify({'message': 'Zine deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete zine: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

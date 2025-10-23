
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', page_id='home')

@app.route('/products')
def products():
    return render_template('products.html', page_id='products')

@app.route('/contact')
def contact():
    return render_template('contact.html', page_id='contact')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

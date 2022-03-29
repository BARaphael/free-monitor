from distutils.command.config import config
from flask import Flask
from flask import send_from_directory
from flask_cors import CORS
from functools import wraps
import math

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Data server is running.'

def generateWebPage(dataGetter):
    app.add_url_rule('/data/',view_func=dataGetter)

def linkConfigFile(filename):
    def readConfigFile():
        f = open(filename,"r")
        configs = f.read()
        f.close()
        return configs
    app.add_url_rule('/config/',view_func = readConfigFile)

@app.route("/<path:path>")
def static_dir(path):
    return send_from_directory("./free-monitor/dist", path)

def run():
    app.run(host="0.0.0.0",debug=True)

if __name__ == "__main__":
    ticks = 0
    def random():
        global ticks
        ticks += 1
        print(ticks)
        return str(math.sin(ticks))
    generateWebPage(random)
    run()


    
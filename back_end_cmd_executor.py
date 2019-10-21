import subprocess

import pandas as pd
import numpy as np
import pymapd
import flask
import win32api
from sklearn import datasets
from pprint import pprint
from flask_cors import CORS
from flask import request
from flask import jsonify


from flask import Flask
app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api', methods=['POST'])
def api():
    if not request.json:
        abort(400)
    editorContent = request.json['contentOfEditor']   
    return jsonify(output=execute(editorContent))

def execute(contentOfEditor):
	language = "Java"

	tempFile = open("TestHelloWorld.java", "w+")

	tempFile.write("""public class TestHelloWorld{

		""" + contentOfEditor + "}")

	tempFile.close()

	#TRY TO READ FILE
	readTempFile = open("TestHelloWorld.java", "r+")

	proc = subprocess.Popen(['javac', 'TestHelloWorld.java'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	outComp, errComp = proc.communicate()

	proc = subprocess.Popen(['java', 'TestHelloWorld'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	outExec, errExec = proc.communicate()

	outputFile = open("TestHelloWorldOutput.txt", "w+")

	outputFile.write(outExec.decode("utf-8"))

	outputText =  "Compilation Output:\n" + outComp.decode("utf-8") + "\n\nCompilation Error Log:\n" + errComp.decode("utf-8")  + "Execution Output:\n" + outExec.decode("utf-8") + "\n\nExecution Error Log:\n" + errExec.decode("utf-8")
	
	if errComp.decode("utf-8") != "":
		outputText = errComp.decode("utf-8")
	elif errExec.decode("utf-8") != "":
		outputText = errExec.decode("utf-8")
	else:
		outputText = outExec.decode("utf-8")	


	outputText.replace("\r", "\n")
	return outputText

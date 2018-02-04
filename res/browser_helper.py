#!/usr/bin/env python
from __future__ import print_function

import os
import sys
import json
import struct
import subprocess
import platform

VERSION = '1.0'
def log(message):
	with open("log.txt", 'a') as file:
		file.write(
		message+"\n"
			)
# log("begin ")
# sys.exit(0)
try:
	sys.stdin.buffer

	# Python 3.x version
	# Read a message from stdin and decode it.
	def getMessage():
		rawLength = sys.stdin.buffer.read(4)
		if len(rawLength) == 0:
			sys.exit(0)
		messageLength = struct.unpack('@I', rawLength)[0]
		message = sys.stdin.buffer.read(messageLength).decode('utf-8')
		return json.loads(message)

	def encodeMessage(messageContent):
		encodedContent = json.dumps(messageContent).encode('utf-8')
		encodedLength = struct.pack('@I', len(encodedContent)) 
		return {'length': encodedLength, 'content': encodedContent}

	# Send an encoded message to stdout
	def sendMessage(messageContent):
		encodedContent = json.dumps(messageContent).encode('utf-8')
		encodedLength = struct.pack('@I', len(encodedContent))

		sys.stdout.buffer.write(encodedLength)
		sys.stdout.buffer.write(encodedContent)
		sys.stdout.buffer.flush()

except AttributeError:
	# Python 2.x version (if sys.stdin.buffer is not defined)
	# Read a message from stdin and decode it.
	def getMessage():
		rawLength = sys.stdin.read(4)
		if len(rawLength) == 0:
			sys.exit(0)
		messageLength = struct.unpack('@I', rawLength)[0]
		message = sys.stdin.read(messageLength)
		return json.loads(message)

	def encodeMessage(messageContent):
		encodedContent = json.dumps(messageContent).encode('utf-8')
		encodedLength = struct.pack('@I', len(encodedContent))
		return {'length': encodedLength, 'content': encodedContent}

	# Send an encoded message to stdout
	def sendMessage(messageContent):
		encodedContent = json.dumps(messageContent)
		encodedLength = struct.pack('@I', len(encodedContent))

		sys.stdout.write(encodedLength)
		sys.stdout.write(encodedContent)
		sys.stdout.flush()


def installLinux():
	home_path = os.getenv('HOME')

	manifest = {
		'name': 'zeronet_helper',
		'description': 'Zeronet Helper',
		'path': os.path.realpath(__file__),
		'type': 'stdio',
	}
	locations = {
		'chrome': os.path.join(home_path, '.config', 'google-chrome', 'NativeMessagingHosts'),
		'chromium': os.path.join(home_path, '.config', 'chromium', 'NativeMessagingHosts'),
		'firefox': os.path.join(home_path, '.mozilla', 'native-messaging-hosts'),
	}
	filename = 'zeronet_helper.json'

	for browser, location in locations.items():
		if os.path.exists(os.path.dirname(location)):
			if not os.path.exists(location):
				os.mkdir(location)

			browser_manifest = manifest.copy()
			if browser == 'firefox':
				browser_manifest['allowed_extensions'] = ['zeronet_helper@krzysztof113']
			else:
				browser_manifest['allowed_origins'] = ['chrome-extension://dimpgnefikmgckabhapfncdmfbnjdgab/']

			with open(os.path.join(location, filename), 'w') as file:
				file.write(
					json.dumps(browser_manifest, indent=2, separators=(',', ': '), sort_keys=True).replace('  ', '\t') + '\n'
				)

def installWindows():
	import sys
	try:
		import winreg as _winreg
	except:
		import _winreg

	this_file = os.path.realpath(__file__)
	install_path = os.path.dirname(this_file)

	manifest = {
		'name': 'zeronet_helper',
		'description': 'Zeronet Helper',
		'path': this_file,
		'type': 'stdio',
	}

	manifest['path'] = filename = os.path.join(install_path, 'zeronet_helper.bat')
	with open(filename, 'w') as file:
		file.write('@echo off\r\ncall "%s" "%s" %%1 %%2\r\n' % (sys.executable, this_file))

	registry_locations = {
		'chrome': os.path.join('Software', 'Google', 'Chrome', 'NativeMessagingHosts'),
		'firefox': os.path.join('Software', 'Mozilla', 'NativeMessagingHosts'),
	}

	for browser, registry_location in registry_locations.items():
		browser_manifest = manifest.copy()
		if browser == 'firefox':
			browser_manifest['allowed_extensions'] = ['zeronet_helper@krzysztof113']
		else:
			browser_manifest['allowed_origins'] = ['chrome-extension://to-be-determined/']

		filename = os.path.join(install_path, 'zeronet_helper_%s.json' % browser)
		with open(filename, 'w') as file:
			file.write(
				json.dumps(browser_manifest, indent=2, separators=(',', ': '), sort_keys=True).replace('  ', '\t') + '\n'
			)

		key = _winreg.CreateKey(_winreg.HKEY_CURRENT_USER, registry_location)
		_winreg.SetValue(key, 'zeronet_helper', _winreg.REG_SZ, filename)				
				


def startLinux():
	log("start")
	path = os.path.join(os.getcwd(), 'ZeroNet.sh')
	devnull = open(os.devnull, 'w')
	subprocess.Popen(path, stdout=devnull, stderr=devnull)

def startWindows():
	log("start")
	path = os.path.join(os.getcwd(), 'zeronet.cmd')
	CREATE_BREAKAWAY_FROM_JOB = 0x01000000
	CREATE_NEW_CONSOLE = 0x00000010
	subprocess.Popen(path, creationflags=CREATE_BREAKAWAY_FROM_JOB | CREATE_NEW_CONSOLE)

if __name__ == '__main__':
	if 'install' in sys.argv:
		if sys.argv[1] == 'install':
			#will create manifests with install parameter
			if platform.system() == "Windows":
				print("W")
				installWindows()
			elif platform.system() == "Linux":
				print("L")
				installLinux()
			sys.exit(0)
	else:
		#start without params, receiving messages
		receivedMessage = getMessage()
		if receivedMessage == "start":
			sendMessage(encodeMessage("starting"))
			if platform.system() == "Windows":
				print("W")
				startWindows()
			elif platform.system() == "Linux":
				print("L")
				startLinux()
		elif receivedMessage == "test":
			sendMessage(encodeMessage('OK'))
		sys.exit(0)

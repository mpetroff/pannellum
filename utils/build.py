#!/usr/bin/env python

import os
import tempfile
import sys

JS = [
'js/pannellum.js',
'js/Three.js',
'js/RequestAnimationFrame.js'
]

CSS = [
'css/pannellum.css'
]

HTML = [
'pannellum.htm'
]

def merge(files):
	buffer = []
	for filename in files:
		with open(os.path.join('..', 'src', filename), 'r') as f:
			buffer.append(f.read())
	return "".join(buffer)

def read(filename):
	with open(os.path.join('..','src',filename), 'rb') as f:
		return f.read()

def output(text, filename):
	with open(os.path.join('..', 'build', filename), 'wb') as f:
		f.write(text)

def JScompress(text):
	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)
	out_tuple = tempfile.mkstemp()
	os.system("java -jar compiler.jar --language_in=ECMASCRIPT5 --js %s --js_output_file %s" % (in_tuple[1], out_tuple[1]))
	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()
	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])
	return compressed

def cssCompress(text):
	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)
	out_tuple = tempfile.mkstemp()
	os.system("java -jar yuicompressor-2.4.7.jar %s --type css -o %s --charset utf-8 -v" % (in_tuple[1], out_tuple[1]))
	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()
	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])
	return compressed

def htmlCompress(text):	
	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)
	out_tuple = tempfile.mkstemp()
	os.system("java -jar htmlcompressor-1.5.3.jar --remove-intertag-spaces --remove-quotes --compress-js --js-compressor closure -o %s %s" % (out_tuple[1], in_tuple[1]))
	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()
	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])
	return compressed

def addHeader(text):
	text = text.replace('<!DOCTYPE HTML>','');
	header = '<!DOCTYPE HTML>\n<!-- Pannellum ' + read('../VERSION') + ', http://pannellum.sf.net/ -->\n'
	return header + text

def build(files, css, html, filename):
	folder = ''
	
	cssfilename = filename + '.css'
	htmlfilename = filename + '.htm'
	filename = filename + '.js'
	
	print "=" * 40
	print "Compiling", filename
	print "=" * 40
	
	js = merge(files)
	js = JScompress(js)
	
	print "=" * 40
	print "Compiling", cssfilename
	print "=" * 40
	
	css = merge(css)
	css = css.replace("'img/grab.png'","'data:image/png;base64," + read('css/img/grab.png').encode('base64').replace('\n', '') + "'")
	css = css.replace("'img/grabbing.png'","'data:image/png;base64," + read('css/img/grabbing.png').encode('base64').replace('\n', '') + "'")
	css = css.replace("'img/loading.svg'","'data:image/svg+xml;base64," + read('css/img/loading.svg').encode('base64').replace('\n', '') + "'")
	css = cssCompress(css)
	css = css.replace("'img/sprites.png'","'data:image/png;base64," + read('css/img/sprites.png').encode('base64').replace('\n', '') + "'")
	
	print "=" * 40
	print "Compiling", htmlfilename
	print "=" * 40
	
	html = merge(html)
	html = html.replace('<link type="text/css" rel="Stylesheet" href="css/pannellum.css" />','<style type="text/css">' + css + '</style>')
	html = html.replace('<script type="text/javascript" src="js/Three.js"></script>','')
	html = html.replace('<script type="text/javascript" src="js/RequestAnimationFrame.js"></script>','')
	html = html.replace('<script type="text/javascript" src="js/pannellum.js"></script>','<script type="text/javascript">' + js + '</script>')
	html = html.replace('</div></a><p>Licensing:<br>','</div></a>Version ' + read('../VERSION') + '<p>Licensing:<br>')
	html = htmlCompress(html)
	
	output(addHeader(html), folder + htmlfilename)

def main():
	build(JS, CSS, HTML, 'pannellum')

if __name__ == "__main__":
	main()

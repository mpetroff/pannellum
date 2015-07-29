#!/usr/bin/env python3

import os
import tempfile
import sys
import subprocess
import urllib.parse

JS = [
'js/libpannellum.js',
'js/RequestAnimationFrame.js',
'js/pannellum.js',
'standalone/standalone.js'
]

CSS = [
'css/pannellum.css'
]

HTML = [
'standalone/pannellum.htm'
]

def merge(files):
    buffer = []
    for filename in files:
        with open(os.path.join('../..', 'src', filename), 'r') as f:
            buffer.append(f.read())
    return "".join(buffer)

def read(filename):
    with open(os.path.join('../..','src',filename), 'r') as f:
        return f.read()

def output(text, filename):
    with open(os.path.join('../..', 'build', filename), 'w') as f:
        f.write(text)

def JScompress(text):
    in_tuple = tempfile.mkstemp()
    with os.fdopen(in_tuple[0], 'w') as handle:
        handle.write(text)
    out_tuple = tempfile.mkstemp()
    os.system("java -jar compiler.jar --language_in=ECMASCRIPT5 --warning_level=QUIET --js %s --js_output_file %s" % (in_tuple[1], out_tuple[1]))
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
    os.system("java -jar htmlcompressor-1.5.3.jar --remove-intertag-spaces --remove-quotes -o %s %s" % (out_tuple[1], in_tuple[1]))
    with os.fdopen(out_tuple[0], 'r') as handle:
        compressed = handle.read()
    os.unlink(in_tuple[1])
    os.unlink(out_tuple[1])
    return compressed

def addHeaderHTML(text):
    text = text.replace('<!DOCTYPE HTML>','');
    header = '<!DOCTYPE HTML>\n<!-- Pannellum ' + read('../VERSION') + ', https://github.com/mpetroff/pannellum -->\n'
    return header + text

def addHeaderCSS(text):
    header = '/* Pannellum ' + read('../VERSION') + ', https://github.com/mpetroff/pannellum */\n'
    return header + text

def addHeaderJS(text):
    header = '// Pannellum ' + read('../VERSION') + ', https://github.com/mpetroff/pannellum\n'
    return header + text

def build(files, css, html, filename, release=False):
    folder = ''
    os.makedirs('../../build', exist_ok=True)
    
    cssfilename = filename + '.css'
    htmlfilename = filename + '.htm'
    filename = filename + '.js'
    
    print('=' * 40)
    print('Compiling', filename)
    print('=' * 40)
    
    js = merge(files)
    if release:
        js = js.replace('"_blank">Pannellum</a>','"_blank">Pannellum</a> ' + read('../VERSION'))
    else:
        js = js.replace('"_blank">Pannellum</a>','"_blank">Pannellum</a> ' + subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('utf-8').strip())
    js = JScompress(js)
    
    print('=' * 40)
    print('Compiling', cssfilename)
    print('=' * 40)
    
    css = merge(css)
    css = css.replace("'img/grab.svg'","'data:image/svg+xml," + urllib.parse.quote(read('css/img/grab.svg'),'') + "'")
    css = css.replace("'img/grabbing.svg'","'data:image/svg+xml," + urllib.parse.quote(read('css/img/grabbing.svg'),'') + "'")
    css = cssCompress(css)
    css = css.replace("'img/sprites.svg'","'data:image/svg+xml," + urllib.parse.quote(read('css/img/sprites.svg'),'') + "'")
    css = css.replace("'img/background.svg'","'data:image/svg+xml," + urllib.parse.quote(read('css/img/background.svg'),'') + "'")
    css = css.replace("'img/compass.svg'","'data:image/svg+xml," + urllib.parse.quote(read('css/img/compass.svg'),'') + "'")
    
    print('=' * 40)
    print('Compiling', htmlfilename)
    print('=' * 40)
    
    html = merge(html)
    html = html.replace('<link type="text/css" rel="Stylesheet" href="../css/pannellum.css"/>','<style type="text/css">' + css + '</style>')
    html = html.replace('<script type="text/javascript" src="../js/libpannellum.js"></script>','')
    html = html.replace('<script type="text/javascript" src="../js/RequestAnimationFrame.js"></script>','')
    html = html.replace('<script type="text/javascript" src="../js/pannellum.js"></script>','<script type="text/javascript">' + js + '</script>')
    html = html.replace('<script type="text/javascript" src="standalone.js"></script>','')
    html = htmlCompress(html)
    
    output(addHeaderHTML(html), folder + htmlfilename)
    output(addHeaderCSS(css), folder + cssfilename)
    output(addHeaderJS(js), folder + filename)

def main():
    if (len(sys.argv) > 1 and sys.argv[1] == 'release'):
        build(JS, CSS, HTML, 'pannellum', True)
    else:
        build(JS, CSS, HTML, 'pannellum')

if __name__ == "__main__":
    main()

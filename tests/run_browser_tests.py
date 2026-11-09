#!/usr/bin/env python3
"""Run focused WebGL tests using the repository's existing Selenium setup."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile
from threading import Thread
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chrome', help='Chrome executable; otherwise use Selenium discovery')
    parser.add_argument('--page', default='tests/renderer-tests.html')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
    Thread(target=server.serve_forever, daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix='pannellum-tests-') as folder:
            options = webdriver.ChromeOptions()
            for option in ['--headless', '--no-sandbox', '--no-first-run',
                           '--enable-unsafe-swiftshader', '--use-gl=angle',
                           '--use-angle=swiftshader', '--force-device-scale-factor=1',
                           '--user-data-dir=' + folder]:
                options.add_argument(option)
            if args.chrome:
                options.binary_location = args.chrome
            options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
            driver = webdriver.Chrome(options=options)
            try:
                driver.get('http://127.0.0.1:%d/%s' % (server.server_port, args.page))
                def result(browser):
                    return browser.execute_script("return document.getElementById('result').textContent")
                try:
                    WebDriverWait(driver, 45).until(lambda browser: result(browser).startswith(('PASS (', 'FAIL')))
                except TimeoutException:
                    print('Timed out waiting for test completion')
                report = result(driver)
                print(report)
                if not report.startswith('PASS ('):
                    print(driver.get_log('browser')[-10:])
                    raise SystemExit(1)
            finally:
                driver.quit()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()

#!/usr/bin/env python

'''

Run tests for Pannellum, set up with Continuous Integration.
Contributed by Vanessa Sochat, JoSS Review 2019.
See the project repository for licensing information.

'''

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from random import choice
from threading import Thread
from selenium import webdriver
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from PIL import Image, ImageChops
import argparse
import json
import io
import os
import re
import shutil
import subprocess
import sys
import time
import webbrowser


class PannellumServer(SimpleHTTPRequestHandler):
    '''here we subclass SimpleHTTPServer to capture error messages
    '''
    def log_message(self, format, *args):
        '''log to standard error with a date time string,
            and then call any subclass specific logging functions
        '''
        sys.stderr.write("%s - - [%s] %s\n" %
                     (self.address_string(),
                      self.log_date_time_string(),
                      format%args))

        # Workaround for error trying to GET html
        if not re.search("div", format%args) and not re.search("function", format%args):
            if re.search("404", format%args):
                raise IOError(format%args)

    def log_error(self, format, *args):
        '''catch errors in the log_messages instead
        '''
        pass


class PannellumTester(object):
    ''' bring up a server with a testing robot        
    '''
  
    def __init__(self, **kwargs):
        self.Handler = PannellumServer
        if "port" in kwargs:
            self.port = kwargs['port']
        else:
            self.port = choice(range(8000, 9999))
        print('Selected port is %s' % self.port)
        self.httpd = TCPServer(("", self.port), self.Handler)
        self.server = Thread(target=self.httpd.serve_forever)
        self.server.setDaemon(True)
        self.server.start()
        self.started = True
        self.pause_time = 100
        self.browser = None
        self.headless = False
        self.display = None
        self.driver = "Chrome"
        if "browser" in kwargs:
            self.driver = kwargs['browser']


    def run_tests(self, create_ref=False):
        '''run tests for Pannellum'''

        print("Loading page...")
        self.get_page("http://localhost:%s/tests/tests.html" % self.port)

        print("Running tests...")
        time.sleep(5)

        viewer = self.browser.find_element_by_id("panorama")
        assert self.browser.execute_script("return viewer.isLoaded()") == True

        # Check equirectangular
        assert self.browser.execute_script("return viewer.getScene() == 'equirectangular'")

        # Check movement
        self.browser.execute_script("viewer.setPitch(30).setYaw(-20).setHfov(90)")
        time.sleep(2)
        assert self.browser.execute_script(
            "return viewer.getPitch() == 30 && viewer.getYaw() == -20 && viewer.getHfov() == 90"
        )
        self.browser.find_element_by_class_name("pnlm-zoom-in").click()
        time.sleep(1)
        assert self.browser.execute_script("return viewer.getHfov() == 85")
        self.browser.find_element_by_class_name("pnlm-zoom-out").click()
        time.sleep(1)
        assert self.browser.execute_script("return viewer.getHfov() == 90")
        print("PASS: movement")

        # Check look at
        self.browser.execute_script("viewer.lookAt(-10, 90, 100)")
        time.sleep(2)
        assert self.browser.execute_script(
            "return viewer.getPitch() == -10 && viewer.getYaw() == 90 && viewer.getHfov() == 100"
        )
        print("PASS: look at")

        # Check cube
        self.browser.execute_script("viewer.loadScene('cube')")
        time.sleep(5)
        assert self.browser.execute_script("return viewer.getScene() == 'cube'")

        # Check hot spot
        self.browser.find_element_by_class_name("pnlm-scene").click()
        time.sleep(5)
        assert self.browser.execute_script("return viewer.getScene() == 'multires'")
        print("PASS: hot spot")

        # Check multires
        self.httpd.server_close()


    def get_browser(self,name=None):
        '''get_browser 
           return a browser if it hasn't been initialized yet
        '''
        if name is None:
            name=self.driver

        log_path = "%s-driver.log" % name.lower()

        if self.browser is None:
            options = self.get_options()
            if name.lower() == "Firefox":
                self.browser = webdriver.Firefox(service_log_path=log_path)
            else:
                self.browser = webdriver.Chrome(service_log_path=log_path,
                                                options=options)
        return self.browser


    def get_options(self, width=1200, height=800):
        '''return options for headless, no-sandbox, and custom width/height
        '''
        options = webdriver.ChromeOptions()
        options.add_argument("headless")
        options.add_argument("no-sandbox")
        options.add_argument("window-size=%sx%s" %(width, height))
        return options


    def get_page(self, url, name='Chrome'):
        '''get_page
            open a particular url, checking for Timeout
        '''
        if self.browser is None:
            self.browser = self.get_browser(name)

        try:
            return self.browser.get(url)
        except TimeoutException:
            print('Browser request timeout. Are you connected to the internet?')
            self.browser.close()
            sys.exit(1)

    def stop(self):
        '''close any running browser or server, and shut down the robot
        '''
        if self.browser is not None:
            self.browser.close()
        self.httpd.server_close() 

        if self.display is not None:
            self.display.close()


## MAIN ########################################################################

def get_parser():

    parser = argparse.ArgumentParser(
    description="run tests for Pannellum")

    parser.add_argument("--port",'-p', dest='port', 
                        help="port to run webserver",
                        type=int, default=3030)

    parser.add_argument("--headless", dest='headless',
                        help="start a display before browser",
                        action="store_true", default=False)

    parser.add_argument("--create-ref", dest='create_ref',
                        action="store_true", default=False)

    parser.add_argument("--browser",'-b', dest='browser', 
                        choices=['Firefox', 'Chrome'],
                        help="browser driver to use for the robot",
                        type=str, default="Chrome")
    return parser

def main():

    parser = get_parser()

    try:
        args = parser.parse_args()
    except:
        sys.exit(0)

    # The drivers must be on path
    here = os.path.abspath(os.path.dirname(__file__))
    os.environ['PATH'] = "%s/drivers:%s" %(here, os.environ['PATH'])
    os.chdir(here)

    # We must be in root directory
    os.chdir('../')

    # Iniitalize the tester
    tester = PannellumTester(browser=args.browser,
                             port=args.port,
                             headless=args.headless)

    # Run tests
    tester.run_tests(create_ref=args.create_ref)

    # Clean up shop!
    tester.stop()

if __name__ == '__main__':
    main()

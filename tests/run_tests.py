#!/usr/bin/env python3

"""
Selenium-based test suite for Pannellum

Dependencies:
Python 3, Selenium Python bindings, Pillow, NumPy
Either: Firefox & geckodriver or Chrome & chromedriver

Run tests for Pannellum, set up with Continuous Integration.
Contributed by Vanessa Sochat, JOSS Review 2019.
See the project repository for licensing information.
"""

from random import choice
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import argparse
import io
import os
import re
import subprocess
import sys
import time
import numpy as np
from PIL import Image, ImageChops
from selenium.common.exceptions import TimeoutException
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By


class PannellumServer(SimpleHTTPRequestHandler):
    """Here we subclass SimpleHTTPServer to capture error messages.
    """

    def log_message(self, format, *args):
        """
        Log to standard error with a date time string,
        and then call any subclass specific logging functions.
        """
        sys.stderr.write(
            "%s - - [%s] %s\n"
            % (self.address_string(), self.log_date_time_string(), format % args)
        )

        # Workaround for error trying to GET html
        if not re.search("div", format % args) and not re.search(
            "function", format % args
        ):
            if re.search("404", format % args):
                raise IOError(format % args)

    def log_error(self, format, *args):
        """Catch errors in the log_messages instead.
        """
        pass


class PannellumTester(object):
    """Bring up a server with a testing robot.
    """

    def __init__(self, port=None, browser="Chrome", headless=False):
        self.handler = PannellumServer
        if port:
            self.port = port
        else:
            self.port = choice(range(8000, 9999))
        print("Selected port is %s" % self.port)
        self.httpd = TCPServer(("", self.port), self.handler)
        self.server = Thread(target=self.httpd.serve_forever)
        self.server.daemon = True
        self.server.start()
        self.started = True
        self.pause_time = 100
        self.browser = None
        self.headless = headless
        self.display = None
        self.driver = browser

    def take_screenshot(self, element_id, filename=None):
        """Take a screenshot of an element with a given ID.
        """
        element = self.browser.find_element(By.ID, element_id)
        img = Image.open(io.BytesIO(element.screenshot_as_png)).convert("RGB")
        if filename is not None:
            img.save(filename)
        return img

    def equal_images(self, reference, comparator, name, threshold=5):
        """Compare two images, both loaded with PIL, based on pixel differences."""
        diff = np.mean(np.array(ImageChops.difference(reference, comparator)))
        print("%s difference: %s" % (name, diff))
        if diff >= threshold:
            comparator.save("tests/" + name + "-comparison.png")
            raise ValueError("Screenshot difference is above threshold!")

    def run_tests(self, create_ref=False):
        """Run tests for Pannellum."""

        print("Loading page...")
        self.get_page("http://localhost:%s/tests/tests.html" % self.port)

        print("Running tests...")
        time.sleep(5)

        assert self.browser.execute_script("return viewer.isLoaded()") is True

        # Check equirectangular
        assert self.browser.execute_script(
            "return viewer.getScene() == 'equirectangular'"
        )
        if create_ref:
            self.take_screenshot("panorama", "tests/equirectangular.png")
            subprocess.call(
                ["optipng", "-o7", "-strip", "all", "tests/equirectangular.png"]
            )
        else:
            reference = Image.open("tests/equirectangular.png")
            comparator = self.take_screenshot("panorama")
            self.equal_images(reference, comparator, "equirectangular")
        print("PASS: equirectangular")

        # Check movement
        self.browser.execute_script("viewer.setPitch(30).setYaw(-20).setHfov(90)")
        time.sleep(2)
        assert self.browser.execute_script(
            "return viewer.getPitch() == 30 && viewer.getYaw() == -20 && viewer.getHfov() == 90"
        )
        self.browser.find_element(By.CLASS_NAME, "pnlm-zoom-in").click()
        time.sleep(1)
        assert self.browser.execute_script("return viewer.getHfov() == 85")
        self.browser.find_element(By.CLASS_NAME, "pnlm-zoom-out").click()
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
        if create_ref:
            self.take_screenshot("panorama", "tests/cube.png")
            subprocess.call(["optipng", "-o7", "-strip", "all", "tests/cube.png"])
        else:
            reference = Image.open("tests/cube.png")
            comparator = self.take_screenshot("panorama")
            self.equal_images(reference, comparator, "cube")

        # Check to make sure hotspots are below controls
        self.browser.execute_script("viewer.setPitch(-35)")
        self.browser.execute_script("viewer.setYaw(32)")
        time.sleep(2)
        action = ActionChains(self.browser)
        elem = self.browser.find_element(By.CLASS_NAME, "pnlm-zoom-in")
        action.move_to_element(elem).move_by_offset(1, 1).click().perform()
        assert self.browser.execute_script("return viewer.getHfov() == 95")
        print("PASS: hot spots below UI")

        # Check hot spot
        self.browser.find_element(By.CLASS_NAME, "pnlm-scene").click()
        time.sleep(5)
        assert self.browser.execute_script("return viewer.getScene() == 'multires'")
        print("PASS: hot spot")

        # Check multires
        if create_ref:
            self.take_screenshot("panorama", "tests/multires.png")
            subprocess.call(["optipng", "-o7", "-strip", "all", "tests/multires.png"])
        else:
            reference = Image.open("tests/multires.png")
            comparator = self.take_screenshot("panorama")
            self.equal_images(reference, comparator, "multires")

        # Check hotspot dragging - move from (20, 20) to (0, 0)
        action = ActionChains(self.browser)
        action.drag_and_drop(
            self.browser.find_element(By.CLASS_NAME, "pnlm-hotspot"),
            self.browser.find_element(By.CLASS_NAME,
                "pnlm-render-container"
            ),  # drops in the middle of the element
        )
        action.perform()
        time.sleep(1)
        assert self.browser.execute_script(
            "var hs = viewer.getConfig().hotSpots[0]; return Math.abs(hs.yaw) < 0.001 && Math.abs(hs.pitch) < 0.001"
        )
        print("PASS: hot spot dragging")

        self.httpd.server_close()

    def get_browser(self, name=None):
        """Return a browser if it hasn't been initialized yet.
        """
        if name is None:
            name = self.driver

        log_path = "tests/%s-driver.log" % name.lower()

        if self.browser is None:
            if name.lower() == "firefox":
                fp = webdriver.FirefoxProfile()
                fp.set_preference("layout.css.devPixelsPerPx", "1.0")
                self.browser = webdriver.Firefox(
                    service_log_path=log_path, firefox_profile=fp
                )
                self.browser.set_window_size(800, 600)
            else:
                from selenium.webdriver.chrome.service import Service
                service = Service(service_log_path=log_path)
                options = webdriver.ChromeOptions()
                options.add_argument("headless")
                options.add_argument("no-sandbox")
                options.add_argument("window-size=800x600")
                self.browser = webdriver.Chrome(
                    service=service, options=options
                )
        return self.browser

    def get_page(self, url):
        """Open a particular URL, checking for timeout.
        """
        if self.browser is None:
            self.browser = self.get_browser()

        try:
            return self.browser.get(url)
        except TimeoutException:
            print("Browser request timeout. Are you connected to the internet?")
            self.browser.close()
            sys.exit(1)

    def stop(self):
        """Close any running browser or server and shut down the robot.
        """
        if self.browser is not None:
            self.browser.close()
        self.httpd.server_close()

        if self.display is not None:
            self.display.close()


def get_parser():
    parser = argparse.ArgumentParser(description="Run tests for Pannellum")

    parser.add_argument(
        "--port",
        "-p",
        dest="port",
        help="Port to run web server",
        type=int,
        default=None,
    )

    parser.add_argument(
        "--headless",
        dest="headless",
        help="Start a display before browser",
        action="store_true",
        default=False,
    )

    parser.add_argument(
        "--create-ref", dest="create_ref", action="store_true", default=False
    )

    parser.add_argument(
        "--browser",
        "-b",
        dest="browser",
        choices=["Firefox", "Chrome"],
        help="Browser driver to use for the robot",
        type=str,
        default="Chrome",
    )
    return parser


def main():
    parser = get_parser()

    try:
        args = parser.parse_args()
    except:
        sys.exit(0)

    # Add this script's directory, in case it contains driver binaries
    here = os.path.abspath(os.path.dirname(__file__))
    os.environ["PATH"] = here + ":" + os.environ["PATH"]
    os.chdir(here)

    # We must be in root directory
    os.chdir("..")

    # Initialize the tester
    tester = PannellumTester(
        browser=args.browser, port=args.port, headless=args.headless
    )

    # Run tests
    tester.run_tests(create_ref=args.create_ref)

    # Clean up shop!
    tester.stop()


if __name__ == "__main__":
    main()

"""
Selenium-based test suite for Pannellum

Dependencies:
Python 3, Selenium Python bindings, Firefox, geckodriver, Pillow, NumPy
"""

import http.server
import time
import threading
import io
import subprocess
import os
import numpy as np
from PIL import Image, ImageChops
from selenium import webdriver


# Set to true to create a new set of reference images
CREATE_REF = False


# Run web server
print("Starting web server...")
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # cd to script dir
os.chdir("..")
httpd = http.server.HTTPServer(
    ("localhost", 8000), http.server.SimpleHTTPRequestHandler
)
thread = threading.Thread(None, httpd.serve_forever)
thread.start()


# Create a new instance of the Firefox driver
print("Starting web driver...")
if os.environ.get("TRAVIS_JOB_NUMBER"):
    # Configuration for Travis CI / Sauce Labs testing
    driver = webdriver.Remote(
        command_executor="https://ondemand.saucelabs.com:443/wd/hub",
        desired_capabilities={
            "username": os.environ["SAUCE_USERNAME"],
            "accessKey": os.environ["SAUCE_ACCESS_KEY"],
            "tunnel-identifier": os.environ["TRAVIS_JOB_NUMBER"],
            "build": os.environ["TRAVIS_JOB_NUMBER"],
            "browserName": "firefox",
            "seleniumVersion": "3.141.0",
        },
    )
else:
    fp = webdriver.FirefoxProfile()
    fp.set_preference("layout.css.devPixelsPerPx", "1.0")
    driver = webdriver.Firefox(firefox_profile=fp)
    driver.set_window_size(800, 600)


def run_tests():
    # Load page
    print("Loading page...")
    driver.get("http://localhost:8000/tests/tests.html")

    # Make sure viewer loaded
    print("Running tests...")
    time.sleep(5)
    viewer = driver.find_element_by_id("panorama")
    assert driver.execute_script("return viewer.isLoaded()") == True

    # Check equirectangular
    assert driver.execute_script("return viewer.getScene() == 'equirectangular'")
    if CREATE_REF:
        viewer.screenshot("tests/equirectangular.png")
        subprocess.call(["optipng", "-o7", "-strip", "all", "equirectangular.png"])
    else:
        reference = Image.open("tests/equirectangular.png")
        screenshot = Image.open(io.BytesIO(viewer.screenshot_as_png)).convert("RGB")
        diff = np.mean(np.array(ImageChops.difference(screenshot, reference)))
        print("equirectangular difference:", diff)
        assert diff < 3
    print("PASS: equirectangular")

    # Check movement
    driver.execute_script("viewer.setPitch(30).setYaw(-20).setHfov(90)")
    time.sleep(2)
    assert driver.execute_script(
        "return viewer.getPitch() == 30 && viewer.getYaw() == -20 && viewer.getHfov() == 90"
    )
    driver.find_element_by_class_name("pnlm-zoom-in").click()
    time.sleep(1)
    assert driver.execute_script("return viewer.getHfov() == 85")
    driver.find_element_by_class_name("pnlm-zoom-out").click()
    time.sleep(1)
    assert driver.execute_script("return viewer.getHfov() == 90")
    print("PASS: movement")

    # Check look at
    driver.execute_script("viewer.lookAt(-10, 90, 100)")
    time.sleep(2)
    assert driver.execute_script(
        "return viewer.getPitch() == -10 && viewer.getYaw() == 90 && viewer.getHfov() == 100"
    )
    print("PASS: look at")

    # Check cube
    driver.execute_script("viewer.loadScene('cube')")
    time.sleep(5)
    assert driver.execute_script("return viewer.getScene() == 'cube'")
    if CREATE_REF:
        viewer.screenshot("tests/cube.png")
        subprocess.call(["optipng", "-o7", "-strip", "all", "cube.png"])
    else:
        reference = Image.open("tests/cube.png")
        screenshot = Image.open(io.BytesIO(viewer.screenshot_as_png)).convert("RGB")
        diff = np.mean(np.array(ImageChops.difference(screenshot, reference)))
        print("cube difference:", diff)
        assert diff < 3
    print("PASS: cube")

    # Check hot spot
    driver.find_element_by_class_name("pnlm-scene").click()
    time.sleep(5)
    assert driver.execute_script("return viewer.getScene() == 'multires'")
    print("PASS: hot spot")

    # Check multires
    if CREATE_REF:
        viewer.screenshot("tests/multires.png")
        subprocess.call(["optipng", "-o7", "-strip", "all", "multires.png"])
    else:
        reference = Image.open("tests/multires.png")
        screenshot = Image.open(io.BytesIO(viewer.screenshot_as_png)).convert("RGB")
        diff = np.mean(np.array(ImageChops.difference(screenshot, reference)))
        print("multires difference:", diff)
        assert diff < 3
    print("PASS: multires")


try:
    run_tests()
finally:
    driver.quit()
    httpd.shutdown()
    thread.join()

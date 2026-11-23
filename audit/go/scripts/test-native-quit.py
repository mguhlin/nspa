#!/usr/bin/env python3
"""Drive the real Linux SSAT window under Xvfb; no test-mode close bypasses."""
import argparse
import ctypes
import json
import os
from pathlib import Path
import subprocess
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('binary', type=Path)
parser.add_argument('--evidence', type=Path, required=True)
args = parser.parse_args()
binary = args.binary.resolve()
args.evidence.mkdir(parents=True, exist_ok=True)
checks = []

def xdo(*parts):
    return subprocess.check_output(['xdotool', *map(str, parts)], text=True, stderr=subprocess.DEVNULL).strip()

def launch(label):
    log = (args.evidence / f'{label}.log').open('w')
    app = subprocess.Popen([str(binary)], stdout=log, stderr=subprocess.STDOUT)
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        if app.poll() is not None:
            raise RuntimeError(f'{label}: app exited before opening')
        try:
            window = xdo('search', '--onlyvisible', '--pid', app.pid, '--name', '^Scholarship Security Audit Toolkit$').splitlines()[0]
            xdo('windowmove', window, 0, 0)
            xdo('windowfocus', window)
            time.sleep(2)
            return app, window, log
        except (subprocess.CalledProcessError, IndexError):
            time.sleep(.1)
    app.terminate()
    try: app.wait(timeout=3)
    except subprocess.TimeoutExpired: app.kill(); app.wait()
    log.close()
    raise RuntimeError(f'{label}: no native window')

def click(window, x, y):
    xdo('mousemove', '--window', window, x, y, 'click', 1)
    time.sleep(.35)

def request_window_close(window):
    # Send the same ICCCM WM_DELETE_WINDOW request as a window manager's X button.
    class Data(ctypes.Union):
        _fields_ = [('l', ctypes.c_long * 5), ('b', ctypes.c_char * 20)]
    class Message(ctypes.Structure):
        _fields_ = [('type', ctypes.c_int), ('serial', ctypes.c_ulong), ('send_event', ctypes.c_int),
                    ('display', ctypes.c_void_p), ('window', ctypes.c_ulong), ('message_type', ctypes.c_ulong),
                    ('format', ctypes.c_int), ('data', Data)]
    class Event(ctypes.Union):
        _fields_ = [('message', Message), ('pad', ctypes.c_long * 24)]
    lib = ctypes.CDLL('libX11.so.6')
    lib.XOpenDisplay.argtypes = [ctypes.c_char_p]; lib.XOpenDisplay.restype = ctypes.c_void_p
    lib.XInternAtom.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int]; lib.XInternAtom.restype = ctypes.c_ulong
    lib.XSendEvent.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_int, ctypes.c_long, ctypes.POINTER(Event)]
    lib.XFlush.argtypes = [ctypes.c_void_p]; lib.XCloseDisplay.argtypes = [ctypes.c_void_p]
    display = lib.XOpenDisplay(None)
    if not display:
        raise RuntimeError('Could not connect to test X display')
    event = Event()
    event.message.type = 33
    event.message.display = display
    event.message.window = int(window)
    event.message.message_type = lib.XInternAtom(display, b'WM_PROTOCOLS', 0)
    event.message.format = 32
    event.message.data.l[0] = lib.XInternAtom(display, b'WM_DELETE_WINDOW', 0)
    if not lib.XSendEvent(display, int(window), 0, 0, ctypes.byref(event)):
        raise RuntimeError('Could not send native window-close request')
    lib.XFlush(display); lib.XCloseDisplay(display)
    time.sleep(.35)

def wait_for_exit(app, label):
    try:
        code = app.wait(timeout=6)
    except subprocess.TimeoutExpired:
        raise AssertionError(f'{label}: process remained running after Close anyway')
    assert code == 0, f'{label}: abnormal exit {code}'

def dispose(app, log):
    if app.poll() is None:
        app.terminate()
        try: app.wait(timeout=3)
        except subprocess.TimeoutExpired: app.kill(); app.wait()
    log.close()

app, window, log = launch('clean')
try:
    click(window, 1290, 46)  # Quit app, in the fixed 1360x900 native window.
    wait_for_exit(app, 'clean')
    checks.append('Quit app exits a clean session normally')
finally:
    dispose(app, log)

for method in ['button', 'window']:
    app, window, log = launch(method)
    try:
        click(window, 180, 120)  # My roadmap creates an unsaved, empty audit.
        request = (lambda: click(window, 1290, 46)) if method == 'button' else (lambda: request_window_close(window))
        request()
        # The safe/default action must keep the app open.
        xdo('key', '--window', window, 'Return')
        time.sleep(.3)
        assert app.poll() is None, f'{method}: Keep working closed the app'
        request()
        xdo('key', '--window', window, 'Escape')
        time.sleep(.3)
        assert app.poll() is None, f'{method}: Escape closed the app'
        request()
        # Focus starts on Keep working; Tab selects Close anyway.
        xdo('key', '--window', window, 'Tab', 'Return')
        wait_for_exit(app, method)
        checks.append(f'{method}: Keep working and Escape preserve session; Close anyway exits with code 0')
    finally:
        dispose(app, log)
report = {'passed': True, 'checks': checks}
(args.evidence / 'native-quit.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))

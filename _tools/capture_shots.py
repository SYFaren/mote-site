#!/usr/bin/env python3
"""Capture real mote / mote-x window screenshots via X11."""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from Xlib import X, XK, display
from Xlib.ext import xtest

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "_demo"
OUT = ROOT / "gallery"
MOTE = Path("/home/syfaren/Projects/mote/mote/linux/build/mote")
MOTEX = Path("/home/syfaren/Projects/mote/mote-x/linux/build/mote-x")
CFG_MOTE = Path.home() / ".config/mote/config"
CFG_MOTEX = Path.home() / ".config/mote-x/config"

DISP = display.Display()
ROOT_WIN = DISP.screen().root


def write_cfg(path: Path, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body)


def backup(path: Path) -> bytes | None:
    if path.exists():
        return path.read_bytes()
    return None


def restore(path: Path, data: bytes | None) -> None:
    if data is None:
        if path.exists():
            path.unlink()
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def win_title(win) -> str:
    try:
        atom = DISP.intern_atom("WM_NAME")
        v = win.get_full_property(atom, X.AnyPropertyType)
        if v and v.value:
            if isinstance(v.value, bytes):
                return v.value.decode("utf-8", "replace")
            return str(v.value)
    except Exception:
        pass
    return ""


def find_windows(substr: str):
    atom = DISP.intern_atom("_NET_CLIENT_LIST")
    prop = ROOT_WIN.get_full_property(atom, X.AnyPropertyType)
    found = []
    if not prop:
        return found
    for wid in prop.value:
        win = DISP.create_resource_object("window", wid)
        title = win_title(win)
        if substr in title:
            found.append((wid, title, win))
    return found


def wait_window(substr: str, timeout: float = 8.0):
    t0 = time.time()
    while time.time() - t0 < timeout:
        DISP.sync()
        hits = find_windows(substr)
        if hits:
            return hits[0]
        time.sleep(0.15)
    raise RuntimeError(f"window not found: {substr}")


def focus(win) -> None:
    win.set_input_focus(X.RevertToParent, X.CurrentTime)
    try:
        win.configure(stack_mode=X.Above)
    except Exception:
        pass
    DISP.sync()
    time.sleep(0.12)


def keycode(name: str) -> int:
    keysym = XK.string_to_keysym(name)
    if not keysym:
        raise ValueError(name)
    return DISP.keysym_to_keycode(keysym)


def tap(name: str, mods: list[str] | None = None) -> None:
    mods = mods or []
    for m in mods:
        xtest.fake_input(DISP, X.KeyPress, keycode(m))
    xtest.fake_input(DISP, X.KeyPress, keycode(name))
    xtest.fake_input(DISP, X.KeyRelease, keycode(name))
    for m in reversed(mods):
        xtest.fake_input(DISP, X.KeyRelease, keycode(m))
    DISP.sync()
    time.sleep(0.08)


def type_text(s: str) -> None:
    for ch in s:
        if ch == " ":
            tap("space")
            continue
        if ch.isupper() or ch in "~!@#$%^&*()_+{}|:\"<>?":
            # shift+key for simple ASCII
            name = {
                "_": "underscore",
                "-": "minus",
                ".": "period",
                "/": "slash",
                ":": "colon",
            }.get(ch, ch.lower())
            if ch.isupper():
                tap(ch.lower(), ["Shift_L"])
            else:
                tap(name, ["Shift_L"] if ch.isupper() else [])
            continue
        name = {
            "-": "minus",
            ".": "period",
            "/": "slash",
            "_": "underscore",
        }.get(ch, ch)
        tap(name)
    time.sleep(0.1)


def kill_apps() -> None:
    subprocess.run(["pkill", "-x", "mote"], check=False)
    subprocess.run(["pkill", "-x", "mote-x"], check=False)
    time.sleep(0.35)


def launch(
    bin_path: Path, args: list[str], geometry: str = "920x640"
) -> subprocess.Popen:
    env = os.environ.copy()
    env["DISPLAY"] = env.get("DISPLAY", ":0")
    return subprocess.Popen(
        [str(bin_path), "-g", geometry] + args,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def capture(wid: int, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".raw.png")
    # Client window id → usually no WM decorations
    r = subprocess.run(
        ["import", "-window", str(wid), str(tmp)],
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(r.stderr or "import failed")
    # Light trim of any solid outer rim; keep content
    subprocess.run(
        ["convert", str(tmp), "-trim", "+repage", str(out)],
        check=False,
    )
    if not out.exists() or out.stat().st_size < 1000:
        shutil.move(str(tmp), str(out))
    elif tmp.exists():
        tmp.unlink()
    print(f"ok {out.name} ({out.stat().st_size} bytes)")


def shot_mote_classic(bak_mote) -> None:
    write_cfg(CFG_MOTE, "win_w=920\nwin_h=640\n")
    kill_apps()
    # Clean classic mote shot: short C file, no wrap-demo text, no dirty *
    p = launch(MOTE, [str(DEMO / "hello.c")])
    try:
        wid, title, win = wait_window("mote")
        focus(win)
        time.sleep(0.55)
        capture(wid, OUT / "01-mote-classic.png")
    finally:
        p.terminate()
        try:
            p.wait(timeout=2)
        except subprocess.TimeoutExpired:
            p.kill()
        time.sleep(0.2)
        restore(CFG_MOTE, bak_mote)


def shot_motex(
    name: str,
    files: list[Path],
    cfg: str,
    after=None,
    geometry: str = "920x640",
) -> None:
    bak = backup(CFG_MOTEX)
    write_cfg(CFG_MOTEX, cfg)
    kill_apps()
    p = launch(MOTEX, [str(f) for f in files], geometry=geometry)
    try:
        wid, title, win = wait_window("mote-x")
        focus(win)
        time.sleep(0.5)
        if after:
            after(win)
            time.sleep(0.35)
            # re-resolve id in case title changed
            wid, title, win = wait_window("mote-x")
            focus(win)
            time.sleep(0.2)
        capture(wid, OUT / name)
    finally:
        # SIGTERM so it may rewrite config — restore after
        p.terminate()
        try:
            p.wait(timeout=2)
        except subprocess.TimeoutExpired:
            p.kill()
        time.sleep(0.2)
        restore(CFG_MOTEX, bak)


def with_us_layout(fn):
    """Type Latin keys regardless of current XKB layout."""

    def wrapped(win):
        prev = subprocess.run(
            ["setxkbmap", "-query"], capture_output=True, text=True, check=False
        )
        layout = "us"
        for line in (prev.stdout or "").splitlines():
            if line.startswith("layout:"):
                layout = line.split(":", 1)[1].strip().split(",")[0]
                break
        subprocess.run(["setxkbmap", "us"], check=False)
        try:
            fn(win)
        finally:
            subprocess.run(["setxkbmap", layout], check=False)

    return wrapped


@with_us_layout
def after_find(win) -> None:
    focus(win)
    tap("f", ["Control_L"])
    time.sleep(0.15)
    type_text("Account")


@with_us_layout
def after_goto(win) -> None:
    focus(win)
    tap("g", ["Control_L"])
    time.sleep(0.15)
    type_text("12")


def after_help(win) -> None:
    focus(win)
    tap("F1")


def main() -> int:
    if not MOTE.exists() or not MOTEX.exists():
        print("binaries missing", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    kill_apps()
    bak_mote = backup(CFG_MOTE)
    bak_motex = backup(CFG_MOTEX)

    try:
        shot_mote_classic(bak_mote)

        shot_motex(
            "02-motex-syntax-dark.png",
            [DEMO / "account.c"],
            "win_w=920\nwin_h=640\ntheme=0\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
        )
        shot_motex(
            "03-motex-theme-light.png",
            [DEMO / "notes.py"],
            "win_w=920\nwin_h=640\ntheme=1\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
        )
        shot_motex(
            "04-motex-find.png",
            [DEMO / "account.c"],
            "win_w=920\nwin_h=640\ntheme=0\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
            after=after_find,
        )
        shot_motex(
            "05-motex-multidoc.png",
            [DEMO / "account.c", DEMO / "utils.h", DEMO / "readme.txt"],
            "win_w=920\nwin_h=640\ntheme=0\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
        )
        shot_motex(
            "06-motex-wrap.png",
            [DEMO / "readme.txt"],
            "win_w=640\nwin_h=480\ntheme=2\nfont_px=14\nwrap=1\nshow_ws=0\nfind_case=0\nfind_word=0\n",
            geometry="640x480",
        )
        shot_motex(
            "07-motex-goto.png",
            [DEMO / "account.c"],
            "win_w=920\nwin_h=640\ntheme=0\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
            after=after_goto,
        )
        shot_motex(
            "08-motex-theme-slate.png",
            [DEMO / "account.c"],
            "win_w=920\nwin_h=640\ntheme=2\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
        )
        shot_motex(
            "09-motex-help.png",
            [DEMO / "account.c"],
            "win_w=920\nwin_h=640\ntheme=0\nfont_px=14\nwrap=0\nshow_ws=0\nfind_case=0\nfind_word=0\n",
            after=after_help,
        )
    finally:
        kill_apps()
        restore(CFG_MOTE, bak_mote)
        restore(CFG_MOTEX, bak_motex)

    print("done ->", OUT)
    for p in sorted(OUT.glob("*.png")):
        print(" ", p.name, p.stat().st_size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

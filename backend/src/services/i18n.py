import json
from ..config import ROOT, DEFAULT_LANG

_messages = {}

def load(lang: str | None):
    lang = (lang or DEFAULT_LANG).lower()
    global _messages
    try:
        _messages = json.load(open(ROOT / "src" / "i18n" / f"{lang}.json", "r", encoding="utf-8"))
    except FileNotFoundError:
        _messages = json.load(open(ROOT / "src" / "i18n" / "en.json", "r", encoding="utf-8"))

def t(key: str, **kwargs):
    msg = _messages.get(key, key)
    try:
        return msg.format(**kwargs)
    except Exception:
        return msg
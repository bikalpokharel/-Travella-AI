import re

def normalize(text: str) -> str:
    t = text.lower()
    t = re.sub(r"[!\?\.,;:\-\(\)\[\]\{\}/\\'`~@#$%^&*_+=|<>]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t
#!/usr/bin/env python3
"""Build The 6-Day YouTube Accelerator PDF guide."""

import weasyprint
import os

HTML_PATH = "/home/user/orbitlearn/youtube-accelerator-guide.html"
PDF_PATH = "/home/user/orbitlearn/The-6-Day-YouTube-Accelerator.pdf"

def build():
    html = weasyprint.HTML(filename=HTML_PATH)
    html.write_pdf(PDF_PATH)
    size_mb = os.path.getsize(PDF_PATH) / (1024 * 1024)
    print(f"PDF created: {PDF_PATH}")
    print(f"File size: {size_mb:.2f} MB")

if __name__ == "__main__":
    build()

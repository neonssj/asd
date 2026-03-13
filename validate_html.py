import html.parser
import sys

class HTMLChecker(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.tags.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if not self.tags:
            print(f"Error: End tag </{tag}> without start tag at line {self.getpos()[0]}")
            return
        last_tag, pos = self.tags.pop()
        if last_tag != tag:
            print(f"Error: Mismatched tag. Expected </{last_tag}> but got </{tag}> at line {self.getpos()[0]}")
            # Try to recover by skipping current tag or popping until match
            pass

    def close(self):
        super().close()
        for tag, pos in self.tags:
            print(f"Warning: Unclosed tag <{tag}> started at line {pos[0]}")

with open("c:/Users/bquez/Desktop/neon/neonv2/asd/index.html", "r", encoding="utf-8") as f:
    checker = HTMLChecker()
    checker.feed(f.read())
    checker.close()
    print("Validation finished.")

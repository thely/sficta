import requests
import json
from bs4 import BeautifulSoup
from pprint import pprint

weburl = requests.get("https://en.wikipedia.org/wiki/Rider-Waite_tarot_deck").text
soup = BeautifulSoup(weburl, 'html.parser')

result = {}

gallery = soup.find_all("li", {"class": "gallerybox"})

for item in gallery:
	toAdd = {}

	srcset = item.findChildren("a", {"class": "image"})[0].findChildren("img")[0].get('srcset')
	headers = item.findChildren("div", {"class": "gallerytext"})[0].findChildren("a")[0].get('href')

	link = "https://en.wikipedia.org" + headers
	toAdd['link'] = link

	if srcset:
		biggest = "http:" + srcset.split(", ")[1].replace(" 2x", "")
		toAdd['img'] = biggest

	nameOnly = headers.replace("/wiki/", "").replace("_(Tarot_card)", "")
	result[nameOnly] = toAdd

# pprint(result)

with open('wiki_images.json', 'w') as fp:
	json.dump(result, fp, indent=2)
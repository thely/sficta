var dim, canvas, deck, meanings, isPicked, images, tex;

function preload() {
	tex = loadImage('assets/img/pam-c-back.jpg');
}

function setup() {
	dim = createVector(550, 550);
	canvas = createCanvas(dim.x, dim.y);
	canvas.parent("tarotPick");

	rectMode(CENTER);
	loadJSON("assets/js/card_text.json", function(e) { 
		meanings = e;
		console.log(meanings.cards);
		deck = new Deck(meanings.cards);
		loop();
	});
	loadJSON("assets/js/wiki_images.json", function(e) {
		images = e;
	});
	noLoop();
	isPicked = 0;
}

function draw() {
	clear();
	deck.show();
	noLoop();
}

function mouseClicked() {
	var c = deck.checkClicked(mouseX, mouseY);
	if (c != false) {
		if (isPicked == 3) {
			isPicked = 0;
			select(".card1").elt.innerHTML = "";
			select(".card2").elt.innerHTML = "";
			select(".card3").elt.innerHTML = "";

			deck.build(meanings.cards);
			loop();
		}

		var cl = (isPicked == 0) ? ".card1" : ".card2";
		cl = (isPicked == 2) ? ".card3" : cl;
		select(cl).elt.innerHTML = formatCardText(c.errata);

		isPicked++;
	}
	
}

function formatCardText(c) {
	var txt = "<img src=" + images[c.name_short].img + ">";
	txt += "<h3>" + c.name + "</h3>";
	txt += "<p class='caption'>" + c.meaning_up + "</p>";
	txt += "<p class='caption'>" + "<a href='" + 
			images[c.name_short].link +
			"'>View more information about this card on Wikipedia" +
			"</a></p>";

	return txt;
}


class Card {
	constructor(x, y, deg, text, index) {
		this.pos = createVector(x, y);
		this.dim = createVector(40, 60);
		this.deg = deg;
		this.index = index;

		this.errata = text;
		this.text = text.name_short;
		this.c = [random(0,255),255,random(0,255)];

		this.type = text.type;
		this.num = text.value_int;

		var p = p5.Vector.add(this.pos, this.dim);
		var cent = p5.Vector.add(this.pos, p5.Vector.div(this.dim, 2));
		this.p = [
			bigRot(this.pos, this.deg, cent),
			bigRot(createVector(this.pos.x,this.pos.y+this.dim.y), this.deg, cent),
			bigRot(p, this.deg, cent),
			bigRot(createVector(this.pos.x+this.dim.x, this.pos.y), this.deg, cent)
		];
	}

	show() {
		// fill(this.num/max * 255, 255, this.num/max * 255);
		fill(this.c[0],this.c[1],this.c[2]);
		// texture(tex);
		quad(
			this.p[0].x,this.p[0].y,
			this.p[1].x,this.p[1].y,
			this.p[2].x,this.p[2].y,
			this.p[3].x,this.p[3].y
		);
	}

	checkClicked(x,y) {
		return collidePointPoly(x, y, this.p);
	}
}

Card.prototype.determineOrigin = function(text) {
	var num = text.replace(/\D/g, "");
	if (text.includes("ar")) {
		return { "suit": "major", "number": num };
	}
	else {
		var suit = text.replace(/[0-9]/g, '');
		return { "suit": suit, "number": num };
	}
}

class Deck {
	constructor(t) {
		// var txt = this.makeText();
		var txt = shuffle(t);
		this.len = 78;
		this.radius = 140;
		this.cards = [];
		
		this.build(txt);
	}

	build(txt) {
		this.cards = [];
		var radius = 150;
		var max = txt.length;
		var cards = []
		for (var i = 0; i < max; i++) {
			var v = this.pickVariance(i);
			var x = (radius*v) * cos(radians(i * 360 / max)) + width / 2.3;
			var y = (radius*v) * sin(radians(i * 360 / max)) + height / 2.1;
			var a = radians(i/max*360) - HALF_PI;

			cards.push(new Card(x, y, a, txt[i], i));
		}

		this.cards = cards;
	}

	show() {
		console.log("attempting to draw");
		console.log(this.cards);
		for (var card of this.cards) {
			if (card != 0) {
				card.show();
			}
		}
	}

	checkClicked(x,y) {
		var clickList = [];
		for(var card of this.cards) {
			// console.log(card);
			if (card == 0) continue;
			var clicked = card.checkClicked(x, y);
			if (clicked) {
				clickList.push(card);
			}
		}

		if (clickList.length == 0) return false;
		var ret = random(clickList);
		this.cards[ret.index] = 0;
		loop();
		console.log(ret);
		return ret;
	}
}

// Deck.prototype.makeText = function() {
// 	var values = ["ac", "02", "03", "04", "05", "06", "07", "08", "09", "10", "pa", "kn", "qu", "ki"];
// 	var suits = ["sw","cu","wa","pe"]; //swords, cups, wands, penta
// 	var deckText = [];

// 	for (var suit of suits) {
// 		for (var val of values) {
// 			deckText.push(suit + val);
// 		}
// 	}

// 	for (var i = 0; i <= 21; i++) {
// 		var index = ("0" + i).slice(-2);
// 		deckText.push("ar" + index);
// 	}

// 	return shuffle(shuffle(deckText));
// }

Deck.prototype.pickVariance = function(i) {
	var v;
	v = (i % 1.5 == 0) ? 	random(1., 1.5) : 1;
	v = (i % 2 == 0) ? 		random(0.4, 0.7) : v;
	v = (i % 2.5 == 0) ? 	random(0.8, 1.3) : v;
	v = (i % 4 == 0) ? 		random(0.7, 1.1) : v;
	v = (i % 5 == 0) ?		random(0.1,0.6) : v;
	v = (i % 7 == 0) ?		random(1.1, 1.5) : v;
	v = (i % 1.1 == 0) ? 	random(1., 1.5) : v;

	v += random(0, 0.2);

	return v;
}

// ---------------------------------------
// Messy math stuff
// ---------------------------------------
function bigRot(point, angle, center) {
	var tempX = point.x - center.x;
	var tempY = point.y - center.y;

	var x = tempX * cos(angle) - tempY * sin(angle);
	var y = tempX * sin(angle) + tempY * cos(angle);

	return createVector(x + center.x, y + center.y);
}

function collidePointPoly(px, py, vertices) {
  var collision = false;

  // go through each of the vertices, plus the next vertex in the list
  var next = 0;
  for (var current=0; current<vertices.length; current++) {

    // get next vertex in list if we've hit the end, wrap around to 0
    next = current+1;
    if (next == vertices.length) next = 0;

    // get the PVectors at our current position this makes our if statement a little cleaner
    var vc = vertices[current];    // c for "current"
    var vn = vertices[next];       // n for "next"

    // compare position, flip 'collision' variable back and forth
    if (((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
         (px < (vn.x-vc.x)*(py-vc.y) / (vn.y-vc.y)+vc.x)) {
            collision = !collision;
    }
  }
  return collision;
}
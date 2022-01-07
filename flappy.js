'use strict'

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

canvas.width = 256;
canvas.height = 512;

let bird = new Image();
let back = new Image();
let road = new Image();
let pipeUp = new Image();
let pipeBottom = new Image();

bird.src = "img/bird.png";
back.src = "img/back.png";
road.src = "img/road.png";
pipeUp.src = "img/pipeUp.png";
pipeBottom.src = "img/pipeBottom.png";

let fly_audio = new Audio();
let score_audio = new Audio();

fly_audio.src = "audio/fly.mp3";
score_audio.src = "audio/score.mp3";

let score_text = document.getElementById("score");
let best_score_text = document.getElementById("best_score");

//====================Змінні для пташки
let xPos = 10;		//Позиція пташки по осі X.  
let yPos = 150;		//Позиція пташки по осі Y.


let gravity = 0.2; 	//Змінна яка відповідає за значення на яке пташка буде постійно опускатися при виконанні функції draw()
let velY = 0;		//Проміжна змінна яка використовується для створення ефекту падіння пташки.

let gap = 110;		//Висота простору між верхньою та нижньою трубами, який необхідний для того, щоб пташка могла пролетіти між трубами

let pipe = [];		//Масив з позиціями верхніх труб.

pipe[0] = {
	x: canvas.width,
	y: 0
}

let score = 0;		//Рахунок поточої спроби гравця
let best_score = 0; //Найкращий набраний рахунок за поточну сесію гри

let pause = false;

//==========================Головна функція=======================
function draw() {
	if (!pause) {								 //якщо гравець не натиснув на кнопку "Pause", тоді в змінній pause знаходиться значення false. Вираз, що ми бачимо в умові повертає нам обернене значення. 
												 //Тобто якшо в змінній pause знаходиться значення false, вираз поверне значення true. Так само з випадком якщо  pause = true, тоді !pause = false 
		
		context.drawImage(back, 0, 0);           //Малюємо заданий фон
		context.drawImage(bird, xPos, yPos);     //Малюємо пташку

		if (yPos + bird.height >= canvas.height - road.height) { //<==== Якщо позиція пташки знаходиться нижче чим знаходиться дорога, ми маємо оновити сторінку (Симуляція падіння пташки на дорогу)
			reload();
		}

		velY += gravity; //===== Кожного разу, коли виконується функція draw(), ми рухаємо кожну трубу від правої частини холста до лівої частини.
        yPos += velY;    //Нам необхідно розуміти коли потрібно видаляти трубу яку вже не видно. Така труба вже пройшла весь холст, тобто вийшла за ліву частину холста.

		
		
		for (let i = 0; i < pipe.length; i++) {
			if (pipe[i].x < -pipeUp.width) {   //=====Перевірка, чи потрібно видаляти поточну трубу з масиву труб======
				
			//===== Якщо кордината поточної труби, знаходиться лівіше від початку холста аж на довжину самої труби,
            // тобто труба пройшла весь шлях від правої частини холста до лівої частини. Продовжила рухатись навіть після того як її вже не видно на холсті. І як тільки відстань від цієї труби до лівої частини холста стала більшою
            // ніж товщина самої труби, за такої умови ми видаляємо поточну трубу.
            // Графічне пояснення 
            /*                                               ---------------------------
труба, яка вже пройшла весь шлях  ----------------->|   |    |                          |<---------Полотно на якому відбувається вся логіка нашої гри
від правого краю холста до лівого                   |   |    |                          |
краю                                                |   |    |                          |
                                                   -|   |-   |                          |
                                                   |     |   |                          |
                                                   -------   ----------------------------
                                                        |----| 
                                                          ^
                                                          |-------------------------- Відстань яку пройшла труба від лівого краю. 
                                                                                      Якщо ця відстань буде більшою за довжину самої труби,тоді ми видаляємо поточну трубу 
                                                                                        
            */
				pipe.shift(); //Видаляємо перший елемент з масиву труб. На даний момент першим елементом в масиві труб є кординати поточної труба. При видадені цих даних умовно можна сказати що ми видаляємо поточну трубу
			} else {
				
				// Якщо труба ще не змістиласть на заборонену відстань, продовжуємо малювати всі об`єкти 
				context.drawImage(pipeUp, pipe[i].x, pipe[i].y);
				context.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap);

				pipe[i].x -= 2; 	// Зміщуємо поточну трубу в ліво на встановлене значення

				 //=====додавання нової труби, а саме pipeUp до масиву з трубами======== 
				if (pipe[i].x == 80) {	//Якщо позиція труби по осі X знаходиться лівіше ніж 80, ми додаємо в кінець масиву труб нову трубу.
					pipe.push({ 
						x : canvas.width, 
						y : Math.floor(Math.random() * pipeUp.height) - pipeUp.height
					});
				}
			}
			//Перевірка чи пташка зіштовхнулась, хоча б з однією із труб
			if (xPos + bird.width >= pipe[i].x &&  xPos <= pipe[i].x + pipeUp.width &&  (yPos <= pipe[i].y + pipeUp.height || yPos + bird.height >= pipe[i].y + pipeUp.height + gap)) {
				reload();
			}

			if (pipe[i].x == 0) { 	//Отримання нового очка при проходжені труб.
				score++;
				score_audio.play(); //Програш звуку набору додаткового очка
			}
		}


		context.drawImage(road, 0, canvas.height - road.height);  // Малюємо дорогу

		score_text.innerHTML = "SCORE: " + score; 					//Перезаписуємо значення зміної в якій зберігається поточний рахунок гравця.	 
		best_score_text.innerHTML = "BEST SCORE: " + best_score;    //Перезаписуємо значення зміної в якій зберігається найкращий рахунок набраний в цій грі.

	} else {
		//Якщо ж гравець все ж таки натиснув на кнопку "Pause", ми продовжуємо відмальовувати об`єкти не змінючи їх позицій. Тому і створюється ефект паузи.
		
		context.drawImage(back, 0, 0);
		context.drawImage(bird, xPos, yPos);
		
		for (let i = 0; i < pipe.length; i++) {
			context.drawImage(pipeUp, pipe[i].x, pipe[i].y);
			context.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap);
		}
		
		context.drawImage(road, 0, canvas.height - road.height);
		context.fillStyle = 'rgba(0, 0, 0, 0.3)';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

}
// Функці перезавантаження рівня
function reload() {
	if (score > best_score) {
		best_score = score;
	}
	xPos = 10;
	yPos = 150;
	velY = 0;
	pipe = [];
	score = 0;
	pipe[0] = {
		x: canvas.width,
		y: 0
	}
}

//=======================Взліт пташки по натисканню клавіши ArrowUp ================================
document.addEventListener("keydown", function(event){
	if(event.code == 'ArrowUp'){
		moveUp();
	}
});

function moveUp() {
	velY = -4;			//"Піднімаємо" пташку по осі Y на встановлене значення
	fly_audio.play();	//Програш звуку "взмаху крил пташки"
}

//========================Функція для встановлення паузи та повернення до гри============================
function game_pause() {
	pause = !pause;
}

setInterval(draw, 20);
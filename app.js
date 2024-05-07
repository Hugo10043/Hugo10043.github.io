"use strict";


/* Selecccionamos la caja */
const caja = document.querySelector(".caja");

/* Guardar la puntuacion */
let puntuacionActual = 0;

/* Llamar a la velocidad desde el JSON */
let velNiv = modos["niveles"][0]["velocidad"]; // Velocidad del primer nivel por defecto
const resultadoPntalla = document.querySelector(".resultado");

/* Altura por la que multiplicamos para generar los divs que haran los cuadrados dentro de la caja */
const width = 15;

/* Array de invasores eliminados */
const invasoresEliminados = [];

/* Indice de la nave */
let indiceNaveActual = 202;

/* Indice de los invasores */
let invasoresIndice;

/* Variable movimiento a la derecha */
let movDerecho = true;

let direccion = 1;

/* Puntuacion del jugador */
let resultado = 0;

/* Indicador para finalizar el juego */
let juegoFinalizado = false;

/* Llevar el control del disparo */
let disparoActivo = false;

/* Sonidos de laser, explosion, game over y victoria */
const laserAudio = document.getElementById("laser");
const explosionAudio = document.getElementById("explosion");
const game_over_audio = document.getElementById("game_over");
const victoria_audio = document.getElementById("victoria");

/* Pedir al usuario el nombre */
let nombre = prompt("Introduce tu nombre para guardar junto tu puntuacion");

/* Boton de volver a jugar */
const volver = document.querySelector(".volver");
const siguiente = document.querySelector(".siguiente");
siguiente.classList.add("oculto");

/* Disminuye el volumen de la explosion */
explosionAudio.volume = 0.3;

/* Creamos un for para añadir divs dentro de la caja donde estos se moveran */
for (let i = 0; i < width * width; i++) {
    const cuadrado = document.createElement("div");
    cuadrado.id = i;
    caja.appendChild(cuadrado);
}

/* Variable para seleccionar todos los cuadrados que hay dentro de la caja */
const cuadrados = Array.from(document.querySelectorAll(".caja div"));

/* Array de los aliens */
const aliens = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39
]

/* Añadir alien a los cuadrados si no esta dentro del array de eliminados */
function dibujar() {
    for (let i = 0; i < aliens.length; i++) {
        if (!invasoresEliminados.includes(i)) {
            cuadrados[aliens[i]].classList.add("invasor");
        }
    }
}

/* Llamar a la funcion para dibujar los invasores */
dibujar();

/* Añadir inicio de la nave */
cuadrados[indiceNaveActual].classList.add("nave");

/* Funcion para eliminar el id invasores de los cuadrados */
function eliminar() {
    for (let i = 0; i < aliens.length; i++) {
        cuadrados[aliens[i]].classList.remove("invasor");
    }
}

/* Función para verificar si los invasores han alcanzado el fondo del área de juego */
function invasoresAlFinal() {
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i] >= width * (width)) {
            return true;
        }
    }
    return false;
}

/* Funcion de movimiento de los invasores */
function moverInvasores() {
    const bordeIzquierdo = aliens[0] % width === 0;
    const bordeDerecho = aliens[aliens.length - 1] % width === width - 1;
    eliminar();

    if (bordeDerecho && movDerecho) {
        for (let i = 0; i < aliens.length; i++) {
            aliens[i] += width + 1;
            direccion = -1;
            movDerecho = false;
        }
    }

    if (bordeIzquierdo && !movDerecho) {
        for (let i = 0; i < aliens.length; i++) {
            aliens[i] += width - 1;
            direccion = 1;
            movDerecho = true;
        }
    }
    for (let i = 0; i < aliens.length; i++) {
        aliens[i] += direccion;
    }

    dibujar();

    /* Detiene el juego y muestra "GAME OVER" si al menos un invasor llega al fondo del área de juego o un invasor toca la nave */
    if (invasoresAlFinal() || cuadrados[indiceNaveActual].classList.contains("invasor")) {
        juegoFinalizado = true;
        clearInterval(invasoresIndice);
        explosionAudio.play();
        game_over_audio.play();

        /* Añadir animacion de explosion de la nave, con un temporizador */
        cuadrados[indiceNaveActual].classList.add("explosion");
        setTimeout(() => cuadrados[indiceNaveActual].classList.remove("explosion"), 300);

        /* Si queremos que el invasor muera al chocar con la nave, desaparecen los dos */
        cuadrados[indiceNaveActual].classList.remove("invasor");
        cuadrados[indiceNaveActual].classList.remove("nave");

        /* Añadimos pantalla de GAME OVER */
        const imagenGameOver = document.getElementById('perdiste');
        imagenGameOver.classList.remove('oculto');
        imagenGameOver.classList.add('derrota');
        volver.classList.remove("volver");
        volver.classList.add("boton");
    }

    /* Si todos los invasores son eliminados, se genera el "HAS GANADO" */
    if (invasoresEliminados.length === aliens.length) {
        resultadoPntalla.innerHTML = "HAS GANADO";
        juegoFinalizado = true;
        clearInterval(invasoresIndice);
        victoria_audio.play();
        siguiente.classList.remove("oculto");
        siguiente.classList.remove("volver");
        siguiente.classList.add("boton");
        puntuacionActual = resultado;
    }
}

/* Intervalo de movimiento de los invasores */
invasoresIndice = setInterval(moverInvasores, velNiv);

/* Funcion para crear el disparo */
function disparo(e) {
    /* Verificar si el juego ha finalizado */
    if (juegoFinalizado || disparoActivo) return;

    let laserId;
    let laserIndiceActual = indiceNaveActual;

    /* Funcion para dar movimiento al disparo */
    function moverDisparo() {
        cuadrados[laserIndiceActual].classList.remove("laser");

        /* Verificar si laserIndiceActual esta dentro de los limites del juego */
        if (laserIndiceActual - width >= 0) {
            laserIndiceActual -= width;
            cuadrados[laserIndiceActual].classList.add("laser");

            /* Hacer que se elimine la clase invasor si coincide con laser y que aparezca la clase explosion */
            if (cuadrados[laserIndiceActual]) {
                if (cuadrados[laserIndiceActual].classList.contains("invasor")) {
                    cuadrados[laserIndiceActual].classList.remove("invasor");
                    cuadrados[laserIndiceActual].classList.remove("laser");
                    cuadrados[laserIndiceActual].classList.add("explosion");

                    /* Añadir un intervalo de aparicion de la explosion */
                    setTimeout(() => cuadrados[laserIndiceActual].classList.remove("explosion"), 300);
                    clearInterval(laserId);
                    explosionAudio.play();

                    const invasorEliminado = aliens.indexOf(laserIndiceActual);
                    invasoresEliminados.push(invasorEliminado);
                    resultado++;
                    resultadoPntalla.innerHTML = 'PUNTUACIÓN: ' + resultado;
                    console.log(invasoresEliminados);
                    /* Reestablece el disparo */
                    disparoActivo = false;
                }
            } else {
                /* Eliminar el intervalo si el disparo sale del área del juego */
                clearInterval(laserId);
                disparoActivo = false;
            }
            /* Else para establecerlo a false de nuevo para disparar cuando no hay colision */
        } else {
            clearInterval(laserId);
            disparoActivo = false;
        }
    }
    /* Si la tecla pulsada es espacio, empieza el intervalo del disparo */
    if (e.key === " ") {
        disparoActivo = true;
        laserId = setInterval(moverDisparo, 50);
        laserAudio.play();
    }
}

/* Al presionar la tecla se llama a la funcion disparo */
document.addEventListener("keydown", disparo);

/* Funcion para mover la nave */
function moverNave(e) {

    /* Verificar si el juego a terminado */
    if (juegoFinalizado) return;

    /* Eliminamos la nave del valor actual */
    cuadrados[indiceNaveActual].classList.remove("nave");
    switch (e.key) {
        case "ArrowLeft":
            if (indiceNaveActual % width !== 0) {
                indiceNaveActual -= 1;
            }
            break;
        case "ArrowRight":
            if (indiceNaveActual % width < width - 1) {
                indiceNaveActual += 1;
            }
            break;
    }
    /* Añadimos la nave al nuevo valor */
    cuadrados[indiceNaveActual].classList.add("nave");
}
/* Al presionar la tecla se llama la funcion mover nave */
document.addEventListener("keydown", moverNave);

volver.addEventListener('click', () => {
    location.reload();
});

function siguienteNivel() {
    // Incrementar el nivel
    let nivelActual = modos["niveles"].findIndex(nivel => nivel.velocidad === velNiv);
    nivelActual++; // Incrementamos al siguiente nivel
    if (nivelActual >= modos["niveles"].length) {
        nivelActual = 0; // Si supera el máximo, vuelve al primer nivel
    }
    velNiv = modos["niveles"][nivelActual]["velocidad"];

    /* Reiniciar el juego */
    reiniciarJuego();
}

function reiniciarJuego() {

    /* Reiniciar la puntuacion */
    resultado = puntuacionActual;
    resultadoPntalla.innerHTML = "Puntuacion: " + resultado;

    /* Limpiar los invasores eliminados y reiniciar el juego */
    invasoresEliminados.length = 0;
    juegoFinalizado = false;
    disparoActivo = false;

    /* Eliminar los cuadrados de la nave y los invasores */
    cuadrados[indiceNaveActual].classList.remove("nave");
    for (let i = 0; i < aliens.length; i++) {
        cuadrados[aliens[i]].classList.remove("invasor");
    }

    /* Reiniciar la posicion de la nave y los invasores */
    indiceNaveActual = 202;
    aliens.forEach(alien => {
        cuadrados[alien].classList.remove("invasor");
    });

    dibujar();
    cuadrados[indiceNaveActual].classList.add("nave");

    /* Reiniciar el intervalo de movimiento de los invasores */
    clearInterval(invasoresIndice);
    invasoresIndice = setInterval(moverInvasores, velNiv);

    /* Ocultar el botón de siguiente nivel */
    siguiente.classList.add("oculto");
}
siguiente.addEventListener('click', siguienteNivel);



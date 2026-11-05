# Temporizador

Temporizador de intervalos para entrenar: trabajo, descanso, ejercicios, rondas y reinicio
entre rondas. Antes de empezar hay 10 segundos para prepararse, y la pantalla no se apaga
mientras corre.

**Abrir:** https://bass2015.github.io/timer/

## Instalar en el móvil

- **iPhone:** abre el enlace en Safari → botón Compartir → *Añadir a pantalla de inicio*.
- **Android:** abre el enlace en Chrome → menú ⋮ → *Instalar aplicación*.

Una vez instalada funciona sin conexión.

## Uso

La app no usa texto, solo iconos: pesa (trabajo), pausa (descanso), rayo (ejercicios),
flecha circular (rondas), reloj de arena (reinicio de la ronda) y nota (sonido). Toca un valor
para cambiarlo con la rueda; toca fuera para dejarlo. Durante el entreno, un toque en cualquier
parte pausa y muestra seguir, saltar y terminar.

Un zorro de pixel art cruza la pantalla de izquierda a derecha durante cada tiempo de trabajo,
se sienta en los descansos y se duerme al terminar. Los sprites están en `src/fox/sprites.ts`
como cuadrículas de caracteres.

## Desarrollo

```sh
npm install
npm run dev -- --host   # también accesible desde el móvil en la misma red
npm test
npm run build
```

Cada push a `main` se publica en GitHub Pages.

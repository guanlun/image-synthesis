import Canvas from './Canvas';

window.onload = () => {
    const canvasEl: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const canvas = new Canvas(canvasEl);
};
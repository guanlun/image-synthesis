const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);
    renderer.render();

	$('#antialiasing-toggle').bootstrapSwitch({
		onSwitchChange: (evt, state) => {
			renderer.antialiasing = state;
		}
	});

	$('#rerender-button').click(() => renderer.render());
}

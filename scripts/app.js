const Renderer = require('./Renderer');

window.onload = () => {
    const canvasEl = document.getElementById('canvas');

    const renderer = new Renderer(canvasEl);

    setTimeout(() => {
        renderer.render();
    }, 500);

    $('#rerender-button').click(() => renderer.render());

	$('#antialiasing-toggle').bootstrapSwitch({
		onSwitchChange: (evt, state) => {
			renderer.antialiasing = state;
		}
	});

    $('#silhouette-toggle').bootstrapSwitch({
		onSwitchChange: (evt, state) => {
			renderer.silhouetteRendering = state;
		}
	});

    $('#scene-select').change((evt) => {
        const selectedIdx = $('#scene-select').val();
        renderer.selectScene(parseInt(selectedIdx) - 1);
    })


}

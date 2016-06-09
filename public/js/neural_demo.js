var NeuralDemo = {
    canvas: null,
    $canvas: null,
    context: null,
    drawing: false,
    isFreeDraw: false,

    init: function() {
        NeuralDemo.canvas = document.getElementById('digit');
        NeuralDemo.$canvas = $(NeuralDemo.canvas);
        NeuralDemo.context = NeuralDemo.canvas.getContext('2d');
        NeuralDemo.initButtons();
        NeuralDemo.initDrawing();
    },

    // wire up the buttons
    initButtons: function() {
        $('button#get-random').click(NeuralDemo.getRandom);
        $('button#hand-draw').click(function() {
            if (NeuralDemo.drawing) {
                NeuralDemo.processDraw();
            } else {
                NeuralDemo.startDraw();
            }
        });
    },

    // wire up drawing on the canvas
    initDrawing: function() {
        NeuralDemo.canvas.onmousedown = function(e) {
            NeuralDemo.isFreeDraw = true;
            NeuralDemo.context.lineJoin = NeuralDemo.context.lineCap = 'round';
            NeuralDemo.context.moveTo(e.layerX / 10, e.layerY / 10);
        };

        NeuralDemo.canvas.onmousemove = function(e) {
            if (NeuralDemo.drawing && NeuralDemo.isFreeDraw) {
                NeuralDemo.context.lineTo(e.layerX / 10, e.layerY / 10);
                NeuralDemo.context.stroke();
            }
        };

        NeuralDemo.canvas.onmouseup = function() {
            NeuralDemo.isFreeDraw = false;
        };
    },

    // clear the canvas
    clearCanvas: function() {
        NeuralDemo.context.clearRect(0, 0, 28, 28);
        NeuralDemo.context.beginPath();
    },

    // flip the button and toggle canvas as drawable
    startDraw: function() {
        $('ul#guess').html('');
        $('button#hand-draw').text('Process image');
        NeuralDemo.$canvas.addClass('drawing');
        NeuralDemo.drawing = true;
        NeuralDemo.clearCanvas();
    },

    // process the drawn number
    processDraw: function() {
        var i, data;
        var pixels = [];
        $('button#hand-draw').text('Hand draw');
        NeuralDemo.$canvas.removeClass('drawing');
        NeuralDemo.drawing = false;
        data = NeuralDemo.context.getImageData(0, 0, 28, 28).data;
        for (i = 3; i < data.length; i += 4) {
            pixels.push(data[i]);
        }

        NeuralDemo.clearCanvas();
        pixels.forEach(function(val, idx) {
            val = 255 - val;
            NeuralDemo.context.fillStyle = 'rgb(' + val + ',' + val + ',' + val + ')';
            NeuralDemo.context.fillRect(idx % 28, Math.floor(idx / 28), 1, 1);
        });

        $.post('/process', { pixels: pixels }, function(res) {
            $('ul#guess').html(res.guess.map(function(g, i) {
                return '<li>' + i + '<span class="bar" style="width:'
                    + g * 4 + ';">&nbsp;</span>' + g + '%</li>';
            }).join("\n"));
        });
    },

    // get a random piece of data from MNIST
    getRandom: function() {
        $('button#hand-draw').text('Hand draw');
        NeuralDemo.$canvas.removeClass('drawing');
        NeuralDemo.drawing = false;
        $.get('/random', function(res) {
            res.pixels.forEach(function(val, idx) {
                val = 255 - val;
                NeuralDemo.context.fillStyle = 'rgb(' + val + ',' + val + ',' + val + ')';
                NeuralDemo.context.fillRect(idx % 28, Math.floor(idx / 28), 1, 1);
            });
            $('ul#guess').html(res.guess.map(function(g, i) {
                return '<li' + (i === res.actual ? ' class="actual"' : '') + '>' + i
                    + '<span class="bar" style="width:' + g * 4 + ';">&nbsp;</span>' + g + '%</li>';
            }).join("\n"));
        });
    }
};

$(NeuralDemo.init);

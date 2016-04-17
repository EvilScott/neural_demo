var NeuralDemo = {
    context: null,

    init: function() {
        NeuralDemo.context = $('canvas#digit')[0].getContext('2d');
        $('button#get-random').click(NeuralDemo.getRandom);
        NeuralDemo.getRandom();
    },

    getRandom: function() {
        $.get('/random', function(res) {
            res.pixels.forEach(function(val, idx) {
                val = 255 - val;
                NeuralDemo.context.fillStyle = 'rgb(' + val + ',' + val + ',' + val + ')';
                NeuralDemo.context.fillRect(idx % 28, Math.floor(idx / 28), 1, 1);
            });
            $('ul#guess').html(res.guess.map(function(g, i) {
                return '<li' + (i === res.actual ? ' class="actual"' : '') + '>' + i + ': ' + g + '%</li>';
            }).join("\n"));
        });
    }
};

$(NeuralDemo.init);

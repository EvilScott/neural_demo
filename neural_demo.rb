require 'sinatra/base'
require 'brainy'
require 'zlib'
require 'json'

labels, images = nil, nil
Zlib::GzipReader.open('data/t10k-labels-idx1-ubyte.gz') do |file|
  magic, n_labels = file.read(8).unpack('N2')
  raise 'This is not MNIST label file' if magic != 2049
  labels = file.read(n_labels).unpack('C*')
end

Zlib::GzipReader.open('data/t10k-images-idx3-ubyte.gz') do |file|
  magic, n_images = file.read(8).unpack('N2')
  raise 'This is not MNIST image file' if magic != 2051
  n_rows, n_cols = file.read(8).unpack('N2')
  images = file.read(n_images * n_rows * n_cols).unpack('C*').each_slice(n_rows * n_cols)
end
$test_images = labels.zip(images)
$net = Brainy::Network.from_serialized('data/mnist_90.yaml')

class NeuralDemo < Sinatra::Base
  get '/' do
    File.read(File.join(__dir__, 'public', 'index.html'))
  end

  post '/process' do
    guess = $net.evaluate(params[:pixels].map(&:to_f))
    normalized_guess = guess.map { |k| (k  * 100 / guess.reduce(:+)).round(2) }

    content_type :json
    { guess: normalized_guess }.to_json
  end

  get '/random' do
    example = $test_images.sample
    guess = $net.evaluate(example.last)
    normalized_guess = guess.map { |k| (k  * 100 / guess.reduce(:+)).round(2) }

    content_type :json
    { pixels: example.last, guess: normalized_guess, actual: example.first }.to_json
  end
end

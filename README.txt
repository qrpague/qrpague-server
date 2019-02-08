 docker build -t qrpague-server:1 -f dockerfile .

  docker run --name teste-qrpague-server -p 9092:9092  qrpague-server:1
echo copigemini --yolo  $(for p in $(cat paths.txt);do echo "--add-dir $p";done)

#!/usr/bin/env python

f = open('editor.html', 'r')
buildRoot = "build/";
f2 = open(buildRoot+'editor-built.html', 'w')

for line in f:
    if line.startswith("@import"):
        parts = line.strip().split(" ");
        filename = parts[1];
        print("importing %s" % filename);

        f3 = open(buildRoot+filename,"r");
        for line2 in f3:
            f2.write(line2);
    else:
        f2.write(line);


f.close()
f2.close()


#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ln -s $DIR/githooks/* $DIR/.git/hooks/
ln -s $DIR/android/app/src/main/assets/fonts $DIR/

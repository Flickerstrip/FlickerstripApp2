#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm $DIR/.git/hooks/*
ln -s $DIR/githooks/* $DIR/.git/hooks/
rm $DIR/fonts
ln -s $DIR/android/app/src/main/assets/fonts $DIR/

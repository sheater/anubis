#!/usr/bin/env bash

find server/src client/src -name '*.js' | xargs wc -l

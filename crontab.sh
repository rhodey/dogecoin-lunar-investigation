#!/bin/bash

DISPLAY=:0 gnome-terminal -x bash -c "npm run build && npm run publish && exit"

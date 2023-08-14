#!/bin/bash

REPO=UW-Madison-DSI/community-search
API_URL=https://api.github.com/repos/$REPO/releases/latest
RELEASE_VERSION=`curl --silent $API_URL | jq -r .tag_name`
DOWNLOAD_URL=https://github.com/$REPO/releases/download/$RELEASE_VERSION/embedding_search-$RELEASE_VERSION-py3-none-any.whl
echo "Installing embedding-search $RELEASE_VERSION"
pip install $DOWNLOAD_URL


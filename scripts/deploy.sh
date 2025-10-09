#!/bin/bash

. ./scripts/try.sh

APP_NAME="emudevz"

USERNAME="$1"
TOKEN="$2"
REPO="https://$USERNAME:$TOKEN@github.com/$USERNAME/$APP_NAME"

function show_usage {
	echo "Usage example:"
	echo "./deploy.sh <GITHUB_USERNAME> <GITHUB_TOKEN>"
}

if [ -z "$USERNAME" ] || [ -z "$TOKEN" ] ; then
    show_usage
    exit 1
fi

function compile {
	try npm run build
}

function deploy {
	CURRENT_BRANCH=$(git branch | grep \* | cut -d ' ' -f2)
	git branch -D deploy 2> /dev/null
	git branch -D tmp-deploy 2> /dev/null
	git remote remove ghpages 2> /dev/null
	try git checkout -b deploy
	try git add -Af build/
	try git commit -m "Deploy @ $(date +'%d/%m/%Y')"
	try git subtree split --prefix build deploy -b tmp-deploy
	try git remote add ghpages "$REPO"
	try git push -f ghpages tmp-deploy:gh-pages
	try git checkout "$CURRENT_BRANCH"
}

echo "--- Compiling... ---"
compile

echo "--- Deploying... ---"
deploy

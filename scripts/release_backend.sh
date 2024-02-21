#!/bin/bash


if [ "$1" = "" ]; then
    echo "Usage: release.sh major/minor/patch... (see hatch version --help for details)"
    exit 1
fi

# Make sure we have the latest version of hatchling and build
pip install -U hatch build

### Verison control ###
# Bump version with hatchling
hatch version $1
RELEASE_VERSION=`hatch version`

# Update version in __about__.py
git add embedding_search/__about__.py
git commit -m "bump version to $RELEASE_VERSION"

# Add Git tag and push to remote
git tag $RELEASE_VERSION -m "release $RELEASE_VERSION"
git push --tags
git push

### Build and release ###

rm -r dist
python3 -m build

# Release to github (Require Github CLI)
gh release create $RELEASE_VERSION --generate-notes --latest ./dist/*

# Release to pypi (Require twine. Remember to add token to ~/.pypirc)
# python3 -m twine upload dist/*

# Mkdocs and release to github pages
# mkdocs gh-deploy --force



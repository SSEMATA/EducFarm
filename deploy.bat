@echo off
npm run build
type nul > dist\.nojekyll
git checkout --orphan gh-pages-temp
git --work-tree dist add --all
git --work-tree dist commit -m "Deploy"
git push origin HEAD:gh-pages --force
git checkout -f main
git branch -D gh-pages-temp

# React Hight Performance Todo

- [About](#About)
- [Webpack](#Webpack)
  - [ブラウザ Cache について](#ブラウザ-Cache-について)
  - [Code Splitting について](#Code-Splitting-について)
  - [Size](#Size)
- [React](#React)
  - [React Performance](#React-Performance)
- [App Shell](#App-Shell)
- [Web Performance](#Web-Performance)
- [Service Worker](#Service-Worker)



# About  
- React または SPA 開発に役立つ Webpack の設定や、Performance 改善の方法を調べた
- 少しずつ実装していき、ベストな方法を探っていきたい
- このリポジトリーでは React と TypeScript を使って開発している
- 基本的には Babel と Webpack を使って環境を構築している  

# Webpack  

### ブラウザ Cache について  
`webpack`で`output.filename`を`main.js`のように指定していると、ファイルの変更を検知できないため、キャッシュがうまく機能しない。
ブラウザーは初期読み込み時に静的ファイルをキャッシュに保存するが、その時にファイル名を見て更新されたかどうかを判断している。そのため、ファイル名が変更されていないとファイルを更新しても、表示が変わらないということがよくある。そのため`webpack`では`[name].[contenthash].js`のようにすることで、ファイルの変更のたびにファイル名が変更されるように設定できるようになっている。  
  
参考: https://webpack.js.org/guides/caching/  

### Code Splitting について  
- ちゃんと理解するCode Splitting - Qiita ... https://qiita.com/seya/items/06b160adb7801ae9e66f 
- Code Splitting - Webpack ... https://webpack.js.org/guides/code-splitting/
- The Manifest - Webpack ... https://webpack.js.org/concepts/manifest/
- Code Splitting - React ... https://ja.reactjs.org/docs/code-splitting.html
- Code Splitting - create-react-app ... https://create-react-app.dev/docs/code-splitting/  

### Size  
- webpackのbundle後のJavaScriptのサイズを減らしている話 - リクルート ... https://recruit-tech.co.jp/blog/2018/12/15/try_optimization_webpack_bundle_size/  

# React  

### React Performance  
- パフォーマンス最適化 - React ... https://ja.reactjs.org/docs/optimizing-performance.html
- お前らのReactは遅い - Qiita ... https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f
- React製のSPAのパフォーマンスチューニング実例 - リクルート ... https://recruit-tech.co.jp/blog/2018/09/19/react_spa_performance_tuning/  

# App Shell  
- App Shell モデル - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/architecture/app-shell?hl=ja  

# Web Performance  
- パフォーマンスが重要なのはなぜか - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/why-performance-matters?hl=ja
- RAIL モデルでパフォーマンスを計測する - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rail?hl=ja
- Loading Performance - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/get-started?hl=ja
- レンダリング パフォーマンス - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering?hl=ja  

# Service Worker  
- Service Worker について - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja  

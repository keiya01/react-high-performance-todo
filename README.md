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

## Code Splitting について  

#### なぜコードを分割するのか
コードを分割することで、初期表示を早くすることができる。ユーザーがアクセスした時に、ブラウザはHTML・CSS・JSを読み込みます。この時HTMLは最初に読み込まれ、styleがない状態で表示された後、CSSでスタイリングされ、JSが動き始めます。SPAのようなJSに頼り切ったサイトでは、JS(ReactやVue)はとてもサイズが大きいため、読み込みに時間がかかります。さらに、他にもpackageを使っていればさらに読み込みは遅くなります。そのためコードを分割して必要な時にファイルを読み込むようにすることで、初期表示を早くすることができる。  
  
**参考**  
ちゃんと理解するCode Splitting - Qiita ... https://qiita.com/seya/items/06b160adb7801ae9e66f  

### よくない方法
Webpackの機能を使ってコード分割を行う。一番簡単な方法として、`entry`に複数のファイルを書いて分割する方法を思いつくかもしれないが、この方法だと、`entry`ファイルのそれぞれにmoduleがバンドルされてしまう。例えば、`index.js`と`another.js`が存在し、`another.js`で`lodash`を使っているが、`index.js`では使っていない状況を考える。この場合、`webpack`を使って`build`すると、`index.js`と`another.js`の両方に`module`がバンドルされてしまう。こうなってしまうとコードを分割してもコード量が増えてしまい、逆にオーバーヘッドになってしまう。これを避けるには`SplitChunksPlugin`を使う必要がある。

### コードの重複を防ぐ
コードの重複を防ぐには、`optimization.splitChunks.chunks`を`all`に設定する。

### ダイナミックインポート
ダイナミックインポートを使うことで、特定のファイルにbuild時の設定を組み込むことができたり、指定したmoduleを分割することができる。

**参考**  
Code Splitting - Webpack ... https://webpack.js.org/guides/code-splitting/  
Code Splitting - React ... https://ja.reactjs.org/docs/code-splitting.html  
Code Splitting - create-react-app ... https://create-react-app.dev/docs/code-splitting/  


## Cache  

### ブラウザ Cache について  
`webpack`で`output.filename`を`main.js`のように指定していると、ファイルの変更を検知できないため、キャッシュがうまく機能しない。
ブラウザーは初期読み込み時に静的ファイルをキャッシュに保存するが、その時にファイル名を見て更新されたかどうかを判断している。そのため、ファイル名が変更されていないとファイルを更新しても、表示が変わらないということがよくある。そのため`webpack`では`[name].[contenthash].js`のようにすることで、ファイルの変更のたびにファイル名が変更されるように設定できるようになっている。  
  
参考: https://webpack.js.org/guides/caching/  

### strategy

#### optimization.runtimeChunk

runtimeメインのコードから分けるために使用される。`single`を設定すると、runtimeが一つのfileにまとめられる。  

#### optimization.cacheGroups.vendor

`vendor`を設定すると、特定のmoduleのコードを分割することができる。更新頻度の少ないmoduleを分割することで、キャッシュを効率的に行うことができ、requestの回数を減らすことができる。例えば、`node_modules`は頻繁に更新される`module`ではないので、`node_modules`を分割することで効率的にキャッシュを行うことができる。

```json
  {
    "optimization": {
      "runtimeChunk": "single",
      "cacheGroup": {
        "vendor": {
          "test": /[\\/]node_modules[\\/]/,
          "name": "vendors",
          "chunks": "all"
        }
      }
    }
  }
```

**参照**
Cache - Webpack ... https://webpack.js.org/guides/caching/  

### Size [WIP]  
- webpackのbundle後のJavaScriptのサイズを減らしている話 - リクルート ... https://recruit-tech.co.jp/blog/2018/12/15/try_optimization_webpack_bundle_size/  

# React [WIP]  

### React Performance  
- パフォーマンス最適化 - React ... https://ja.reactjs.org/docs/optimizing-performance.html
- お前らのReactは遅い - Qiita ... https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f
- React製のSPAのパフォーマンスチューニング実例 - リクルート ... https://recruit-tech.co.jp/blog/2018/09/19/react_spa_performance_tuning/  

# App Shell [WIP]  
- App Shell モデル - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/architecture/app-shell?hl=ja
- Next.js ... https://nextjs.org/docs/getting-started

# Web Performance [WIP]  
- パフォーマンスが重要なのはなぜか - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/why-performance-matters?hl=ja
- RAIL モデルでパフォーマンスを計測する - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rail?hl=ja
- Loading Performance - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/get-started?hl=ja
- レンダリング パフォーマンス - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering?hl=ja  

# Service Worker [WIP]  
- Service Worker について - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja  
